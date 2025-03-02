import React, { useState, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";

interface ProductFormProps {
  categories: Category[];
  onSubmitSuccess: () => void;
}

const ProductForm = ({ categories, onSubmitSuccess }: ProductFormProps) => {
  const { createProduct } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    categoryIds: [] as string[],
  });

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

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      setImagePreview(preview);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!selectedFile) {
      setFormError("Por favor, selecione uma imagem para o produto");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);

      if (formData.discount) {
        formDataToSend.append("discount", formData.discount);
      }

      formData.categoryIds.forEach((categoryId) => {
        formDataToSend.append("categoryIds", categoryId);
      });

      formDataToSend.append("image", selectedFile);

      await createProduct(formDataToSend);

      setFormData({
        name: "",
        description: "",
        price: "",
        discount: "",
        categoryIds: [],
      });
      setSelectedFile(null);
      setImagePreview("");

      toast.success("Produto adicionado com sucesso!");

      onSubmitSuccess();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      toast.error(
        "Erro ao salvar produto. Verifique os dados e tente novamente."
      );

      setFormError(
        "Erro ao salvar produto. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formError && (
        <div className="p-4 rounded border border-red-200 text-red-700 mb-4">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome do Produto *
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Descrição *
            </label>
            <textarea
              id="description"
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
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Preço (R$) *
              </label>
              <Input
                type="number"
                id="price"
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
                htmlFor="discount"
                className="block text-sm font-medium mb-1"
              >
                Desconto (%)
              </label>
              <Input
                type="number"
                id="discount"
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
              htmlFor="imageFile"
              className="block text-sm font-medium mb-1"
            >
              Imagem do Produto *
            </label>
            <Input
              type="file"
              id="imageFile"
              name="imageFile"
              accept="image/*"
              onChange={handleImageFileChange}
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
            />
          </div>

          <div className="flex justify-center items-center border rounded-md h-40 bg-zinc-200 dark:bg-zinc-800">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-contain"
                  onError={() => setImagePreview("/placeholder-product.png")}
                />
              </div>
            ) : (
              <div className="text-gray-400">Preview da imagem</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categorias</label>
            <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    value={category.id}
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={handleCategoryChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhuma categoria disponível
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Adicionar Produto"}
        </button>
      </div>
    </motion.form>
  );
};

export default ProductForm;
