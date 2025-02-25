"use client";

import { useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { formatCurrency } from "../helpers/formatCurrency";
import Image from "next/image";

const ProductList = () => {
  const { getProducts, error, loading, products } = useApi();

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <section>Loading...</section>;
  }

  if (error) {
    return <section>{error}</section>;
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tradicionais</h1>
      <div className="flex gap-6 overflow-x-auto pb-4">
        <ul className="flex gap-6">
          {products.map((product) => (
            <li
              key={product.id}
              className="min-w-[280px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-[280px] relative">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2 truncate">
                  {product.name}
                </h2>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ProductList;
