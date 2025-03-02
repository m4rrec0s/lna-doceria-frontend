import { useState } from "react";
import { Product } from "../types/product";
import { Category } from "../types/category";
import axiosClient from "../services/axiosClient";

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
      const response = await axiosClient.get(`/products?id=${id}`);
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
      await getProducts();
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

      if (productData.categoryIds) {
        const formattedData = {
          ...productData,
          categoryIds: productData.categoryIds,
        };

        if ("categories" in formattedData) {
          delete formattedData.categories;
        }

        const response = await axiosClient.put(
          `/products/${id}`,
          formattedData
        );
        await getProducts();
        return response.data;
      } else {
        const response = await axiosClient.put(`/products/${id}`, productData);
        await getProducts();
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
      await getProducts();
      return true;
    } catch (error: unknown) {
      setError("Error deleting product - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      await getCategories();
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
      await getCategories();
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
      await getCategories();
      return true;
    } catch (error: unknown) {
      setError("Error deleting category - " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDisplaySettings = async () => {
    try {
      const response = await axiosClient.get("/display-settings");
      return response.data;
    } catch (error: unknown) {
      setError("Error fetching display settings - " + (error as Error).message);
      throw error;
    }
  };

  const saveDisplaySettings = async (settings: FlexibleDisplaySettings) => {
    try {
      const response = await axiosClient.post("/display-settings", settings);
      return response.data;
    } catch (error: unknown) {
      setError("Error saving display settings - " + (error as Error).message);
      throw error;
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
    getDisplaySettings,
    saveDisplaySettings,
  };
};
