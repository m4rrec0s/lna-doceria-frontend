"use client";

import React, { use } from "react";
import CategoryClient from "./_components/CategoryClient";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <CategoryClient categoryId={id} />;
}
