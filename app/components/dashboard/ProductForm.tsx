import React, { useState, FormEvent, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { Flavor } from "../../types/flavor";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card
} from "../ui/card";
import { InfoIcon } from "lucide-react";

interface ProductFormProps {
  categories: Category[];
  onSubmitSuccess: () => void;
}

const ProductForm = ({ categories, onSubmitSuccess }: ProductFormProps) => {
  const { createProduct, getFlavors } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([]);
  const [showFlavorSelection, setShowFlavorSelection] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    categoryIds: [] as string[],
    minFlavors: "0",
    maxFlavors: "0",
  });

  // Carregar sabores quando uma categoria for selecionada
  useEffect(() => {
    const loadFlavors = async () => {
      let hasFlavorOptions = false;

      if (formData.categoryIds.length === 1) {
        const selectedCategory = categories.find(
          (cat) => cat.id === formData.categoryIds[0]
        );

        if (selectedCategory && selectedCategory.sellingType === "package") {
          try {
            const flavors = await getFlavors({
              categoryId: formData.categoryIds[0],
            });
            setAvailableFlavors(flavors || []);
            hasFlavorOptions = Boolean(flavors && flavors.length > 0);
            setShowFlavorSelection(hasFlavorOptions);
          } catch (error) {
            console.error("Erro ao carregar sabores:", error);
            setAvailableFlavors([]);
            setShowFlavorSelection(false);
          }
        } else {
          setAvailableFlavors([]);
          setShowFlavorSelection(false);
        }
      } else {
        setAvailableFlavors([]);
        setShowFlavorSelection(false);
      }

      if (!hasFlavorOptions) {
        setFormData((prev) =>
          prev.minFlavors === "0" && prev.maxFlavors === "0"
            ? prev
            : { ...prev, minFlavors: "0", maxFlavors: "0" }
        );
      }
    };

    loadFlavors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categoryIds, categories]);

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
      let newCategoryIds;

      if (isChecked) {
        newCategoryIds = [...prev.categoryIds, categoryId];
      } else {
        newCategoryIds = prev.categoryIds.filter((id) => id !== categoryId);
      }

      return { ...prev, categoryIds: newCategoryIds };
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

    if (showFlavorSelection) {
      const minFlavors = Number(formData.minFlavors || 0);
      const maxFlavors = Number(formData.maxFlavors || 0);

      if (minFlavors < 0 || maxFlavors < 0 || maxFlavors < minFlavors) {
        setFormError("Defina uma faixa válida de sabores (mínimo e máximo).");
        setIsSubmitting(false);
        return;
      }

      if (maxFlavors > availableFlavors.length) {
        setFormError("O máximo de sabores não pode ultrapassar os sabores disponíveis.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price.trim());

      if (formData.discount) {
        formDataToSend.append("discount", formData.discount.trim());
      }

      formData.categoryIds.forEach((categoryId) => {
        formDataToSend.append("categoryIds", categoryId);
      });

      if (showFlavorSelection) {
        formDataToSend.append("minFlavors", formData.minFlavors || "0");
        formDataToSend.append("maxFlavors", formData.maxFlavors || "0");
      }

      formDataToSend.append("image", selectedFile);

      await createProduct(formDataToSend);

      setFormData({
        name: "",
        description: "",
        price: "",
        discount: "",
        categoryIds: [],
        minFlavors: "0",
        maxFlavors: "0",
      });
      setSelectedFile(null);
      setImagePreview("");
      setShowFlavorSelection(false);
      setAvailableFlavors([]);

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

          <div>
            <label className="block text-sm font-medium mb-2">
              Categorias *
            </label>
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
                    <span className="text-xs text-gray-500 ml-1">
                      (
                      {category.sellingType === "package"
                        ? "Pacote"
                        : "Unidade"}
                      )
                    </span>
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

          {showFlavorSelection && (
            <div className="space-y-3 rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-sm font-medium text-rose-900">
                Regras de seleção de sabores para o cliente
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="minFlavors" className="mb-1 block text-sm">
                    Mínimo de sabores
                  </Label>
                  <Input
                    id="minFlavors"
                    type="number"
                    min="0"
                    max={String(availableFlavors.length)}
                    value={formData.minFlavors}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minFlavors: e.target.value,
                        maxFlavors:
                          Number(prev.maxFlavors || 0) < Number(e.target.value || 0)
                            ? e.target.value
                            : prev.maxFlavors,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxFlavors" className="mb-1 block text-sm">
                    Máximo de sabores
                  </Label>
                  <Input
                    id="maxFlavors"
                    type="number"
                    min={formData.minFlavors || "0"}
                    max={String(availableFlavors.length)}
                    value={formData.maxFlavors}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxFlavors: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-rose-700">
                Total de sabores disponíveis nesta categoria: {availableFlavors.length}
              </p>
            </div>
          )}
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

          {formData.categoryIds.length > 1 && (
            <Card className="p-3 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50">
              <div className="flex gap-2 text-sm text-amber-700 dark:text-amber-400">
                <InfoIcon className="h-5 w-5 flex-shrink-0" />
                <p>
                  Múltiplas categorias selecionadas. Não é possível associar
                  sabores quando um produto pertence a mais de uma categoria.
                </p>
              </div>
            </Card>
          )}

          {formData.categoryIds.length === 1 && !showFlavorSelection && (
            <Card className="p-3 border-gray-200 bg-gray-50 dark:bg-gray-900/30 dark:border-gray-800">
              <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-400">
                <InfoIcon className="h-5 w-5 flex-shrink-0" />
                <p>
                  Esta categoria não tem sabores associados. Você pode adicionar
                  sabores na aba Sabores do dashboard.
                </p>
              </div>
            </Card>
          )}
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
