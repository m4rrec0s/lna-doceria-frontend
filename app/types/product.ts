import { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  imageUrl: string;
  categoryId: string;
  category: Category[];
  createdAt: string;
  updatedAt: string;
}
