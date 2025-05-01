import { Category } from "./category";
import { Flavor } from "./flavor";

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
  flavor?: Flavor;
}
