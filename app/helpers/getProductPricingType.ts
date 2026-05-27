import { Product } from "../types/product";

export type PricingType = "simple" | "packages" | "grams";

/**
 * Determina o tipo de precificação do produto
 * - simple: apenas preço base (price)
 * - packages: packagePrices está preenchido
 * - grams: gramsPrices está preenchido
 */
export function getProductPricingType(product: Product): PricingType {
  if (product.packagePrices) {
    try {
      const parsed =
        typeof product.packagePrices === "string"
          ? JSON.parse(product.packagePrices)
          : product.packagePrices;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return "packages";
      }
    } catch (e) {
      console.error("Erro ao analisar packagePrices:", e);
    }
  }

  if (product.gramsPrices) {
    try {
      const parsed =
        typeof product.gramsPrices === "string"
          ? JSON.parse(product.gramsPrices)
          : product.gramsPrices;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return "grams";
      }
    } catch (e) {
      console.error("Erro ao analisar packagePrices:", e);
    }
  }

  return "simple";
}

/**
 * Retorna as opções disponíveis (quantidades)
 */
export function getProductOptions(product: Product): string[] {
  const pricingType = getProductPricingType(product);

  if (pricingType === "packages" && product.packagePrices) {
    try {
      const parsed =
        typeof product.packagePrices === "string"
          ? JSON.parse(product.packagePrices)
          : product.packagePrices;
      if (Array.isArray(parsed)) {
        return parsed.map((p) => `${p.quantity} un.`);
      }
    } catch (e) {
      console.error("Erro ao analisar packagePrices:", e);
      return [];
    }
  }

  if (pricingType === "grams" && product.gramsPrices) {
    try {
      const parsed =
        typeof product.gramsPrices === "string"
          ? JSON.parse(product.gramsPrices)
          : product.gramsPrices;
      if (Array.isArray(parsed)) {
        return parsed.map((g) => `${g.quantity}g`);
      }
    } catch (e) {
      console.error("Erro ao analisar gramsPrices:", e);
      return [];
    }
  }

  return [];
}

/**
 * Verifica se o produto tem opções de embalagem
 */
export function hasPackagingOptions(product: Product): boolean {
  return getProductPricingType(product) !== "simple";
}
