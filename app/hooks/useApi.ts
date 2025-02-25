import { useState } from "react";
import { Product } from "../types/product";
import axiosClient from "../services/axiosClient";

export const useApi = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getProducts = async () => {
    try {
      const response = await axiosClient.get("/products");
      const productsData = response.data;

      setProducts(productsData);
    } catch (error: unknown) {
      setError("Error fetching products - " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { products, error, loading, getProducts };
};
