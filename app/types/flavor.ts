import { Category } from "./category";

export interface Flavor {
  id: string;
  name: string;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
}
