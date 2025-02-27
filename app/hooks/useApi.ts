import { useState } from "react";
import { Product } from "../types/product";
import { Category } from "../types/category";
import axiosClient from "../services/axiosClient";

interface PaginationParams {
  page?: number;
  per_page?: number;
  categoryId?: string;
  name?: string;
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

export const useApi = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 1,
  });

  const getProducts = async (params: PaginationParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get<PaginatedResponse<Product>>(
        "/products",
        {
          params,
        }
      );
      setProducts(data.data);
      setPagination(data.pagination);
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
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error: unknown) {
      setError("Error fetching product - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: FormData) => {
    try {
      setLoading(true);
      const response = await axiosClient.post("/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await getProducts(); // Recarregar produtos após criação
      return response.data;
    } catch (error: unknown) {
      setError("Error creating product - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    productData: Partial<Product> & { categoryIds?: string[] }
  ) => {
    try {
      setLoading(true);

      // Verificar se estamos recebendo categoryIds (edição de categorias)
      if (productData.categoryIds) {
        // Se tivermos categoryIds, precisamos formatá-los adequadamente para a API
        const formattedData = {
          ...productData,
          categoryIds: productData.categoryIds,
        };

        // Remover a propriedade categories se existir, pois estamos usando categoryIds
        if ("categories" in formattedData) {
          delete formattedData.categories;
        }

        const response = await axiosClient.put(
          `/products/${id}`,
          formattedData
        );
        await getProducts(); // Recarregar produtos após atualização
        return response.data;
      } else {
        // Caso contrário, mantemos o comportamento original
        const response = await axiosClient.put(`/products/${id}`, productData);
        await getProducts(); // Recarregar produtos após atualização
        return response.data;
      }
    } catch (error: unknown) {
      setError("Error updating product - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await axiosClient.delete(`/products/${id}`);
      await getProducts(); // Recarregar produtos após exclusão
      return true;
    } catch (error: unknown) {
      setError("Error deleting product - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Funções para Categorias
  const getCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/categories");
      setCategories(response.data);
      return response.data;
    } catch (error: unknown) {
      setError("Error fetching categories - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, "id">) => {
    try {
      setLoading(true);
      const response = await axiosClient.post("/categories", categoryData);
      await getCategories(); // Recarregar categorias após criação
      return response.data;
    } catch (error: unknown) {
      setError("Error creating category - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<Category>
  ) => {
    try {
      setLoading(true);
      const response = await axiosClient.put(`/categories/${id}`, categoryData);
      await getCategories(); // Recarregar categorias após atualização
      return response.data;
    } catch (error: unknown) {
      setError("Error updating category - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await axiosClient.delete(`/categories/${id}`);
      await getCategories(); // Recarregar categorias após exclusão
      return true;
    } catch (error: unknown) {
      setError("Error deleting category - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    categories,
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
  };
};
