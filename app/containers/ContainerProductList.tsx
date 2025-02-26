"use client";

import { useEffect } from "react";
import { useApi } from "../hooks/useApi";
import ProductList from "../components/productList";

const ContainerProductList = () => {
  const { getProducts, error, loading, products } = useApi();

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ProductList products={products} loading={loading} error={error} />;
};

export default ContainerProductList;
