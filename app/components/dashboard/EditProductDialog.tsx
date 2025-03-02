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

interface EditProductDialogProps {
  product: Product | null;
  categories: Category[];
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    imageUrl: "",
    categoryIds: [] as string[],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discount: product.discount?.toString() || "",
        imageUrl: product.imageUrl,
        categoryIds: product.categories.map((cat) => cat.id),
      });
      setImagePreview(product.imageUrl);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : undefined,
        imageUrl: formData.imageUrl,
        categoryIds: formData.categoryIds,
      };

      await updateProduct(product.id, productData);
      toast.success("Produto atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Erro ao atualizar produto:", error);
      toast.error(
        "Erro ao atualizar produto. Verifique os dados e tente novamente."
      );
      setFormError(
        "Erro ao atualizar produto. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
                  />
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
                  {categories.map((category) => (
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
