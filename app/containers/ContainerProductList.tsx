"use client";

import { useEffect, useState } from "react";
import { Product } from "../types/product";
import { useApi } from "../hooks/useApi";
import ProductCard from "../components/productCard";

const ContainerProductList = () => {
  const { getProducts } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [getProducts]);

  if (loading) {
    return (
      <div className="w-full py-8 flex justify-center">
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p>Nenhum produto disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Nossos produtos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ContainerProductList;
