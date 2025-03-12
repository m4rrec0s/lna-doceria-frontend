import { Flavor } from "./flavor";

export interface Category {
  id: string;
  name: string;
  sellingType: "package" | "unit";
  packageSizes: number[] | null;
  flavors?: Flavor[];
}
