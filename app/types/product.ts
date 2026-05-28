import { Category } from "./category";
import { Flavor } from "./flavor";

export interface PackagePrice {
  quantity: number;
  price: number;
  discount?: number | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  stock?: number;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  flavorId?: string;
  minFlavors?: number;
  maxFlavors?: number;
  flavor?: Flavor;
  packagePrices?: PackagePrice[] | null;
  unitMinQuantity?: number | null;
  unitMaxQuantity?: number | null;
  gramsPrices?: PackagePrice[] | null;
  gramsOptions?: number[] | null;
  imageUrls?: string[] | null;
}
