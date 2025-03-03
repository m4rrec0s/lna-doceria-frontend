"use client";

import React, { use } from "react";
import ProductClient from "./_components/ProductClient";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <ProductClient productId={id} />;
}
