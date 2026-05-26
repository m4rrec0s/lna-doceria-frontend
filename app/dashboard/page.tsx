"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgePercent, CheckCircle, Package, Tags } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { useApi } from "../hooks/useApi";
import { Product } from "../types/product";
import { Category } from "../types/category";
import { formatCurrency } from "../helpers/formatCurrency";
import { formatDate } from "../helpers/formatDate";

interface MetricCard {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { getAllProducts, getCategories } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [productData, categoryData] = await Promise.all([
          getAllProducts({ page: 1, per_page: 200 }),
          getCategories(),
        ]);
        setProducts(productData ?? []);
        setCategories(categoryData ?? []);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoadError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const activeCount = products.filter((product) => product.active).length;
    const discountedCount = products.filter(
      (product) => (product.discount ?? 0) > 0,
    ).length;
    const inactiveCount = products.length - activeCount;

    const formatCount = (count: number) => (isLoading ? "—" : `${count}`);

    const details: MetricCard[] = [
      {
        label: "Produtos cadastrados",
        value: formatCount(products.length),
        detail: isLoading ? "Carregando..." : `${activeCount} ativos`,
        icon: <Package className="w-6 h-6" />,
      },
      {
        label: "Categorias cadastradas",
        value: formatCount(categories.length),
        detail: isLoading
          ? "Carregando..."
          : categories.length
            ? `${categories.length} disponíveis`
            : "Nenhuma categoria",
        icon: <Tags className="w-6 h-6" />,
      },
      {
        label: "Produtos ativos",
        value: formatCount(activeCount),
        detail: isLoading
          ? "Carregando..."
          : inactiveCount
            ? `${inactiveCount} inativos`
            : "Nenhum inativo",
        icon: <CheckCircle className="w-6 h-6" />,
      },
      {
        label: "Produtos com desconto",
        value: formatCount(discountedCount),
        detail: isLoading
          ? "Carregando..."
          : discountedCount
            ? `${discountedCount} com desconto`
            : "Nenhum desconto ativo",
        icon: <BadgePercent className="w-6 h-6" />,
      },
    ];

    return details;
  }, [products, categories, isLoading]);

  const recentProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 3);
  }, [products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="
          flex
          flex-col
          gap-4
          rounded-3xl
          border
          border-zinc-200
          bg-white
          p-8
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        "
        >
          <div>
            <span className="text-sm font-medium text-zinc-500">Dashboard</span>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
              Visão Geral
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Bem-vindo de volta,{" "}
              <span className="font-medium text-zinc-700">
                {user?.name || "Gerenciador"}
              </span>
              . Gerencie produtos, categorias e a vitrine da confeitaria em um
              só lugar.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/products"
              className="
              rounded-2xl
              bg-zinc-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition-all
              hover:bg-zinc-800
            "
            >
              Gerenciar Produtos
            </Link>
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: "Produtos",
              description: "Cadastre, edite e organize seus produtos.",
              href: "/dashboard/products",
            },
            {
              title: "Categorias",
              description: "Gerencie categorias, sabores e organização.",
              href: "/dashboard/catalog",
            },
            {
              title: "Vitrine",
              description: "Controle seções e destaques da homepage.",
              href: "/dashboard/showcase",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="
              group
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-6
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-1
              hover:border-zinc-300
              hover:shadow-md
            "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {item.description}
                  </p>
                </div>

                <div
                  className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  bg-zinc-100
                  transition-colors
                  group-hover:bg-zinc-900
                  group-hover:text-white
                "
                >
                  →
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* ERROR */}
        {loadError && (
          <div
            className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-600
          "
          >
            {loadError}
          </div>
        )}

        {/* METRICS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-6
              shadow-sm
            "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {metric.label}
                  </p>

                  <h3 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
                    {metric.value}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">{metric.detail}</p>
                </div>

                <div
                  className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-zinc-100
                  text-zinc-700
                "
                >
                  {metric.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RECENT PRODUCTS */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="
          rounded-3xl
          border
          border-zinc-200
          bg-white
          p-7
          shadow-sm
        "
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Produtos recentes
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Últimos produtos atualizados no sistema.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="
              text-sm
              font-medium
              text-zinc-600
              transition-colors
              hover:text-zinc-900
            "
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && (
              <div className="text-sm text-zinc-500">
                Carregando produtos...
              </div>
            )}

            {!isLoading && recentProducts.length === 0 && (
              <div
                className="
                rounded-2xl
                border
                border-dashed
                border-zinc-200
                p-10
                text-center
              "
              >
                <p className="text-sm text-zinc-500">
                  Nenhum produto atualizado recentemente.
                </p>
              </div>
            )}

            {!isLoading &&
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-zinc-100
                  p-4
                  transition-colors
                  hover:bg-zinc-50
                "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                      h-3
                      w-3
                      rounded-full
                      bg-emerald-500
                    "
                    />

                    <div>
                      <p className="font-medium text-zinc-900">
                        {product.name}
                      </p>

                      <p className="text-sm text-zinc-500">
                        Atualizado em {formatDate(product.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
