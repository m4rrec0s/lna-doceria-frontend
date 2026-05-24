'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgePercent, CheckCircle, Package, Tags } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { formatCurrency } from '../helpers/formatCurrency';
import { formatDate } from '../helpers/formatDate';
import './page.css';

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
        console.error('Erro ao carregar dados do dashboard:', error);
        setLoadError('Não foi possível carregar os dados do dashboard.');
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
      (product) => (product.discount ?? 0) > 0
    ).length;
    const inactiveCount = products.length - activeCount;

    const formatCount = (count: number) => (isLoading ? '—' : `${count}`);

    const details: MetricCard[] = [
      {
        label: 'Produtos cadastrados',
        value: formatCount(products.length),
        detail: isLoading ? 'Carregando...' : `${activeCount} ativos`,
        icon: <Package className="w-6 h-6" />,
      },
      {
        label: 'Categorias cadastradas',
        value: formatCount(categories.length),
        detail: isLoading
          ? 'Carregando...'
          : categories.length
          ? `${categories.length} disponíveis`
          : 'Nenhuma categoria',
        icon: <Tags className="w-6 h-6" />,
      },
      {
        label: 'Produtos ativos',
        value: formatCount(activeCount),
        detail: isLoading
          ? 'Carregando...'
          : inactiveCount
          ? `${inactiveCount} inativos`
          : 'Nenhum inativo',
        icon: <CheckCircle className="w-6 h-6" />,
      },
      {
        label: 'Produtos com desconto',
        value: formatCount(discountedCount),
        detail: isLoading
          ? 'Carregando...'
          : discountedCount
          ? `${discountedCount} com desconto`
          : 'Nenhum desconto ativo',
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
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="page-header"
      >
        <h1>Visão Geral</h1>
        <p>Bem-vindo ao seu painel de controle, {user?.email || 'Gerenciador'}</p>
      </motion.div>

      {loadError && <div className="dashboard-error">{loadError}</div>}

      <motion.div
        className="metrics-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {metrics.map((metric, idx) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <div className="metric-card">
              <div className="metric-icon-wrapper">
                <div className={`metric-icon metric-icon-${idx}`}>
                  {metric.icon}
                </div>
              </div>
              <div className="metric-content">
                <p className="metric-label">{metric.label}</p>
                <h3 className="metric-value">{metric.value}</h3>
                <p className="metric-detail">{metric.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="dashboard-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="section-card"
        >
          <div className="section-header">
            <h2>Produtos atualizados recentemente</h2>
            <a href="/dashboard/products" className="section-link">
              Ver catálogo →
            </a>
          </div>
          <div className="activity-list">
            {isLoading && <div className="activity-empty">Carregando...</div>}
            {!isLoading && recentProducts.length === 0 && (
              <div className="activity-empty">
                Nenhum produto atualizado ainda.
              </div>
            )}
            {!isLoading &&
              recentProducts.map((product) => (
                <div key={product.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-title">{product.name}</p>
                    <p className="activity-time">
                      Atualizado em {formatDate(product.updatedAt)}
                    </p>
                  </div>
                  <span className="activity-amount">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
