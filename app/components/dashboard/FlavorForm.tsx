import React, { useState, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Flavor } from "../../types/flavor";
import { Category } from "../../types/category";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import { InfoIcon } from "lucide-react";

interface FlavorFormProps {
  flavor?: Flavor;
  categories: Category[];
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const FlavorForm = ({
  flavor,
  categories,
  onSubmitSuccess,
  onCancel,
}: FlavorFormProps) => {
  const { createFlavor, updateFlavor } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(
    flavor?.imageUrl || ""
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: flavor?.name || "",
    categoryId: flavor?.categoryId || "",
  });

  // Filtramos apenas as categorias que podem ter sabores (principalmente as que vendem por pacote)
  const categoriesWithFlavors = categories.filter(
    (cat) => cat.sellingType === "package"
  );

  // Adicionar este log para depuração
  console.log("Todas as categorias:", categories);
  console.log("Categorias com flavors:", categoriesWithFlavors);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId === "none" ? "" : categoryId,
    }));
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());

      if (formData.categoryId) {
        formDataToSend.append("categoryId", formData.categoryId);
      }

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      if (flavor) {
        // Atualizar sabor existente
        await updateFlavor(flavor.id, formDataToSend);
        toast.success("Sabor atualizado com sucesso!");
      } else {
        // Criar novo sabor
        await createFlavor(formDataToSend);
        toast.success("Sabor adicionado com sucesso!");

        // Limpar formulário
        setFormData({
          name: "",
          categoryId: "",
        });
        setSelectedFile(null);
        setImagePreview("");
      }

      onSubmitSuccess();
    } catch (error) {
      console.error("Erro ao salvar sabor:", error);
      setFormError(
        "Erro ao salvar sabor. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formError && (
        <div className="p-4 rounded border border-red-200 text-red-700 mb-4">
          {formError}
        </div>
      )}

      <Card className="p-4 border-blue-100 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 mb-4">
        <div className="flex gap-2 text-sm text-blue-700 dark:text-blue-400">
          <InfoIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <p>
              Sabores são frequentemente usados para categorias que contêm
              produtos vendidos por pacote, como brigadeiros. Um sabor (ex.:
              beijinho) pode ser associado a uma categoria específica (ex.:
              Brigadeiros tradicionais).
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome do Sabor *
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
              placeholder="Ex: Chocolate, Beijinho, Maracujá, etc."
            />
          </div>

          <div>
            <Label
              htmlFor="categoryId"
              className="block text-sm font-medium mb-1"
            >
              Categoria Associada
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger
                className={cn(
                  categoriesWithFlavors.length === 0 ? "border-amber-300" : ""
                )}
              >
                <SelectValue placeholder="Selecione uma categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}{" "}
                    {category.sellingType === "package" ? "(recomendado)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoriesWithFlavors.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Adicione uma categoria com vendas por pacote antes de associar
                sabores.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="imageFile"
              className="block text-sm font-medium mb-1"
            >
              Imagem do Sabor
            </Label>
            <Input
              type="file"
              id="imageFile"
              name="imageFile"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: Imagem quadrada, tamanho mínimo de 300x300 pixels.
            </p>
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
                  onError={() => setImagePreview("/placeholder-flavor.png")}
                />
              </div>
            ) : (
              <div className="text-gray-400">Preview da imagem</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : flavor
            ? "Atualizar Sabor"
            : "Adicionar Sabor"}
        </button>
      </div>
    </motion.form>
  );
};

export default FlavorForm;
