import React, { useState, useEffect, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Product } from "../../types/product";
import { Category } from "../../types/category";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

const hasFlavorEnabledCategory = (
  categoryIds: string[],
  categories: Category[] = [],
) => {
  const selectedCategories = categories.filter((item) =>
    categoryIds.includes(item.id),
  );
  return selectedCategories.some(
    (category) => (category.flavors?.length || 0) > 0,
  );
};

interface EditProductDialogProps {
  product: Product | null;
  categories?: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditProductDialog = ({
  product,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) => {
  const { updateProduct } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [packagePrices, setPackagePrices] = useState<
    { quantity: number; price: string }[]
  >([]);
  const [gramsOptions, setGramsOptions] = useState<number[]>([]);
  const [gramsInput, setGramsInput] = useState("");
  const [packageQuantityInput, setPackageQuantityInput] = useState("");
  const [packagePriceInput, setPackagePriceInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    imageUrl: "",
    categoryIds: [] as string[],
    minFlavors: "0",
    maxFlavors: "0",
    unitMinQuantity: "",
    unitMaxQuantity: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discount: product.discount?.toString() || "",
        imageUrl: product.imageUrl,
        categoryIds: product.categories?.map((cat) => cat.id) ?? [],
        minFlavors: (product.minFlavors ?? 0).toString(),
        maxFlavors: (product.maxFlavors ?? 0).toString(),
        unitMinQuantity: product.unitMinQuantity ? String(product.unitMinQuantity) : "",
        unitMaxQuantity: product.unitMaxQuantity ? String(product.unitMaxQuantity) : "",
      });
      setPackagePrices(
        (product.packagePrices || []).map((entry) => ({
          quantity: Number(entry.quantity),
          price: Number(entry.price).toString(),
        }))
      );
      setGramsOptions((product.gramsOptions || []).map((item) => Number(item)));
      setImagePreview(product.imageUrl);
    }
  }, [product]);

  const packageSizeOptions = categories
    ? categories
        .filter((category) => formData.categoryIds.includes(category.id))
        .flatMap((category) =>
          category.sellingType === "package" && Array.isArray(category.packageSizes)
            ? category.packageSizes
            : []
        )
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => a - b)
    : [];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categoryId = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => {
      if (isChecked) {
        return { ...prev, categoryIds: [...prev.categoryIds, categoryId] };
      } else {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter((id) => id !== categoryId),
        };
      }
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addPackagePrice = () => {
    const quantity = Number(packageQuantityInput);
    const price = Number(packagePriceInput);
    if (!quantity || quantity <= 0 || Number.isNaN(price) || price < 0) {
      return;
    }

    setPackagePrices((prev) => {
      const filtered = prev.filter((entry) => entry.quantity !== quantity);
      return [...filtered, { quantity, price: price.toString() }].sort(
        (a, b) => a.quantity - b.quantity
      );
    });
    setPackageQuantityInput("");
    setPackagePriceInput("");
  };

  const removePackagePrice = (quantity: number) => {
    setPackagePrices((prev) => prev.filter((entry) => entry.quantity !== quantity));
  };

  const addGramsOption = () => {
    const grams = Number(gramsInput);
    if (!grams || grams <= 0) return;
    setGramsOptions((prev) =>
      [...new Set([...prev, Math.floor(grams)])].sort((a, b) => a - b)
    );
    setGramsInput("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const canEnableFlavorRules = hasFlavorEnabledCategory(
        formData.categoryIds,
        categories,
      );

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : undefined,
        imageUrl: formData.imageUrl,
        categoryIds: formData.categoryIds,
        minFlavors: canEnableFlavorRules ? Number(formData.minFlavors || 0) : 0,
        maxFlavors: canEnableFlavorRules ? Number(formData.maxFlavors || 0) : 0,
        unitMinQuantity: formData.unitMinQuantity ? Number(formData.unitMinQuantity) : undefined,
        unitMaxQuantity: formData.unitMaxQuantity ? Number(formData.unitMaxQuantity) : undefined,
        packagePrices: packagePrices.map((entry) => ({
          quantity: entry.quantity,
          price: Number(entry.price),
        })),
        gramsOptions,
      };

      if (productData.maxFlavors < productData.minFlavors) {
        throw new Error("Faixa de sabores inválida");
      }

      await updateProduct(product.id, productData);
      toast.success("Produto atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Erro ao atualizar produto:", error);
      toast.error(
        "Erro ao atualizar produto. Verifique os dados e tente novamente.",
      );
      setFormError(
        "Erro ao atualizar produto. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 rounded border border-red-200 text-red-700 mb-4">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium mb-1"
                >
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium mb-1"
                >
                  Descrição *
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-price"
                    className="block text-sm font-medium mb-1"
                  >
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                  />
                  {packagePrices.length > 0 && (
                    <p className="text-[10px] text-zinc-500 mt-0.5">Valor unitário (opcional)</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-discount"
                    className="block text-sm font-medium mb-1"
                  >
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    id="edit-discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                  />
                </div>
              </div>

              {formData.price && Number(formData.price) > 0 && (
                <div className="grid grid-cols-2 gap-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mín. unidades</label>
                    <input
                      type="number"
                      name="unitMinQuantity"
                      min="1"
                      value={formData.unitMinQuantity}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Máx. unidades</label>
                    <input
                      type="number"
                      name="unitMaxQuantity"
                      min={formData.unitMinQuantity || "1"}
                      value={formData.unitMaxQuantity}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                    <p className="text-[10px] text-zinc-500 mt-0.5">Vazio = ilimitado</p>
                  </div>
                </div>
              )}

              {hasFlavorEnabledCategory(formData.categoryIds, categories) ? (
                <div className="grid grid-cols-2 gap-4 rounded-md border border-rose-200 bg-rose-50 p-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Mínimo de sabores
                    </label>
                    <input
                      type="number"
                      name="minFlavors"
                      min="0"
                      value={formData.minFlavors}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Máximo de sabores
                    </label>
                    <input
                      type="number"
                      name="maxFlavors"
                      min="0"
                      value={formData.maxFlavors}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600">
                  Regras de sabores so ficam ativas com uma categoria que tenha sabores vinculados.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-imageFile"
                  className="block text-sm font-medium mb-1"
                >
                  Imagem do Produto
                </label>
                <input
                  type="file"
                  id="edit-imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                />
              </div>

              <div className="flex justify-center items-center border rounded-md h-40 bg-zinc-400 dark:bg-zinc-800">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-contain"
                      onError={() =>
                        setImagePreview("/placeholder-product.png")
                      }
                    />
                  </div>
                ) : (
                  <div className="text-gray-400">Preview da imagem</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Categorias
                </label>
                <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
                  {(categories ?? []).map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        value={category.id}
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={handleCategoryChange}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category.id}`}>
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {packageSizeOptions.length > 0 && (
                <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Preço por pacote
                  </p>
                  <p className="text-xs text-blue-700">
                    Quantidades disponíveis: {packageSizeOptions.join(", ")}
                  </p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantidade"
                      value={packageQuantityInput}
                      onChange={(e) => setPackageQuantityInput(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Preço (R$)"
                      value={packagePriceInput}
                      onChange={(e) => setPackagePriceInput(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={addPackagePrice}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>

                  {packagePrices.length > 0 && (
                    <div className="space-y-1 text-sm text-blue-900">
                      {packagePrices.map((entry) => (
                        <div
                          key={entry.quantity}
                          className="flex items-center justify-between rounded bg-white px-2 py-1"
                        >
                          <span>
                            Pacote {entry.quantity}: R$ {Number(entry.price).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePackagePrice(entry.quantity)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm font-medium text-zinc-900">Opções de gramas</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex.: 250"
                    value={gramsInput}
                    onChange={(e) => setGramsInput(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={addGramsOption}
                    className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    +
                  </button>
                </div>
                {gramsOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {gramsOptions.map((grams) => (
                      <button
                        key={grams}
                        type="button"
                        onClick={() =>
                          setGramsOptions((prev) => prev.filter((item) => item !== grams))
                        }
                        className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700"
                      >
                        {grams}g ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditProductDialog };
