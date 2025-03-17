import { useState } from "react";
import { Product } from "../types/product";
import { Category } from "../types/category";
import axiosClient from "../services/axiosClient";
import { Flavor } from "../types/flavor";

interface PaginationParams {
  page?: number;
  per_page?: number;
  categoryId?: string;
  name?: string;
  ids?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface DisplaySettings {
  [key: string]: unknown;
}

type FlexibleDisplaySettings = DisplaySettings | unknown[];

const cache = {
  products: new Map<string, Product[]>(),
  categories: null as Category[] | null,
  flavors: new Map<string, Flavor[]>(),
};

export const useApi = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 1,
  });

  const getCacheKey = (params: PaginationParams) =>
    JSON.stringify({ ...params, per_page: params.per_page || 50 });

  const getProducts = async (
    params: PaginationParams = {},
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(params);

    if (!forceRefresh && cache.products.has(cacheKey)) {
      setProducts(cache.products.get(cacheKey)!);
      return cache.products.get(cacheKey)!;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get<PaginatedResponse<Product>>(
        "/products",
        { params }
      );
      setProducts(data.data);
      setPagination(data.pagination);
      cache.products.set(cacheKey, data.data);
      return data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao buscar produtos";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/products?id=${id}`);
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao buscar produto - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: FormData) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/products", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cache.products.clear();
      await getProducts();
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao criar produto - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    productData: Partial<Product> & { categoryIds?: string[] }
  ) => {
    setLoading(true);
    try {
      const response = await axiosClient.put(`/products/${id}`, productData);
      cache.products.clear();
      await getProducts();
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao atualizar produto - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/products/${id}`);
      cache.products.clear();
      await getProducts();
      return true;
    } catch (error: unknown) {
      setError("Erro ao deletar produto - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async (forceRefresh = false) => {
    if (!forceRefresh && cache.categories) {
      setCategories(cache.categories);
      return cache.categories;
    }

    setLoading(true);
    try {
      const response = await axiosClient.get("/categories");
      setCategories(response.data);
      cache.categories = response.data;
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao buscar categorias - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, "id">) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/categories", categoryData);
      cache.categories = null;
      await getCategories();
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao criar categoria - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<Category>
  ) => {
    setLoading(true);
    try {
      const response = await axiosClient.put(`/categories/${id}`, categoryData);
      cache.categories = null;
      await getCategories();
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao atualizar categoria - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/categories/${id}`);
      cache.categories = null;
      await getCategories();
      return true;
    } catch (error: unknown) {
      setError("Erro ao deletar categoria - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFlavors = async (
    params: { categoryId?: string } = {},
    forceRefresh = false
  ) => {
    const cacheKey = JSON.stringify(params);

    if (!forceRefresh && cache.flavors.has(cacheKey)) {
      setFlavors(cache.flavors.get(cacheKey)!);
      return cache.flavors.get(cacheKey)!;
    }

    setLoading(true);
    try {
      const response = await axiosClient.get("/flavors", { params });
      setFlavors(response.data);
      cache.flavors.set(cacheKey, response.data);
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao buscar sabores - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createFlavor = async (flavorData: FormData) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/flavors", flavorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cache.flavors.clear(); // Limpa o cache de sabores
      await getFlavors(); // Atualiza os dados
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao criar sabor - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFlavor = async (id: string, flavorData: FormData) => {
    setLoading(true);
    try {
      const response = await axiosClient.put(`/flavors/${id}`, flavorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cache.flavors.clear(); // Limpa o cache de sabores
      await getFlavors(); // Atualiza os dados
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao atualizar sabor - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFlavor = async (id: string) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/flavors/${id}`);
      cache.flavors.clear(); // Limpa o cache de sabores
      await getFlavors(); // Atualiza os dados
      return true;
    } catch (error: unknown) {
      setError("Erro ao deletar sabor - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFlavorById = async (id: string) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/flavors/${id}`);
      return response.data;
    } catch (error: unknown) {
      setError("Erro ao buscar sabor - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ### Funções para Configurações de Exibição
  const getDisplaySettings = async () => {
    try {
      const response = await axiosClient.get("/display-settings");
      return response.data;
    } catch (error: unknown) {
      setError(
        "Erro ao buscar configurações de exibição - " + (error as Error).message
      );
      throw error;
    }
  };

  const saveDisplaySettings = async (settings: FlexibleDisplaySettings) => {
    try {
      const response = await axiosClient.post("/display-settings", settings);
      return response.data;
    } catch (error: unknown) {
      setError(
        "Erro ao salvar configurações de exibição - " + (error as Error).message
      );
      throw error;
    }
  };

  // Retorno do hook
  return {
    products,
    categories,
    flavors,
    error,
    loading,
    pagination,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getFlavors,
    createFlavor,
    updateFlavor,
    deleteFlavor,
    getFlavorById,
    getDisplaySettings,
    saveDisplaySettings,
  };
};
