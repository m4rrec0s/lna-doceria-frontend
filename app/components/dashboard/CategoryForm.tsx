import React, { useState, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

interface CategoryFormProps {
  category?: Category;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const CategoryForm = ({
  category,
  onSubmitSuccess,
  onCancel,
}: CategoryFormProps) => {
  const { createCategory, updateCategory } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    sellingType: category?.sellingType || "package",
    packageSize: "",
    packageSizes: category?.packageSizes || [],
  });

  const showAssociatedFlavors =
    category?.flavors && category.flavors.length > 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellingTypeChange = (value: "package" | "unit") => {
    setFormData((prev) => ({ ...prev, sellingType: value }));
  };

  const addPackageSize = () => {
    const size = parseInt(formData.packageSize);
    if (isNaN(size) || size <= 0) return;

    if (!formData.packageSizes.includes(size)) {
      setFormData((prev) => ({
        ...prev,
        packageSizes: [...prev.packageSizes, size].sort((a, b) => a - b),
        packageSize: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, packageSize: "" }));
    }
  };

  const removePackageSize = (size: number) => {
    setFormData((prev) => ({
      ...prev,
      packageSizes: prev.packageSizes.filter((s) => s !== size),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPackageSize();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const categoryData = {
        name: formData.name.trim(),
        sellingType: formData.sellingType as "package" | "unit",
        packageSizes:
          formData.sellingType === "package" ? formData.packageSizes : null,
      };

      if (category) {
        await updateCategory(category.id, categoryData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createCategory(categoryData);
        toast.success("Categoria criada com sucesso!");
      }

      setFormData({
        name: "",
        sellingType: "package",
        packageSize: "",
        packageSizes: [],
      });

      onSubmitSuccess();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      setFormError(
        "Erro ao salvar categoria. Verifique os dados e tente novamente."
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

      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nome da Categoria *
        </Label>
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

      <div className="space-y-2">
        <Label className="block text-sm font-medium">Tipo de Venda *</Label>
        <RadioGroup
          value={formData.sellingType}
          onValueChange={(value: string) =>
            handleSellingTypeChange(value as "package" | "unit")
          }
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="package" id="selling-package" />
            <Label htmlFor="selling-package">Pacote</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unit" id="selling-unit" />
            <Label htmlFor="selling-unit">Unidade</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.sellingType === "package" && (
        <div className="space-y-2">
          <Label htmlFor="packageSize" className="block text-sm font-medium">
            Tamanhos de Pacote
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              id="packageSize"
              name="packageSize"
              value={formData.packageSize}
              onChange={handleChange}
              placeholder="Quantidade por pacote"
              className="flex-grow"
              min="1"
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={addPackageSize}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.packageSizes.map((size) => (
              <Badge
                key={size}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {size} unidades
                <button
                  title="close"
                  type="button"
                  onClick={() => removePackageSize(size)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {showAssociatedFlavors && (
        <div className="space-y-2">
          <Label className="block text-sm font-medium">
            Sabores associados a esta categoria
          </Label>
          <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {category?.flavors?.map((flavor) => (
                <div
                  key={flavor.id}
                  className="text-sm p-1 bg-gray-100 dark:bg-zinc-800 rounded"
                >
                  {flavor.name}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Para gerenciar sabores, acesse a aba Sabores no dashboard.
            </p>
          </div>
        </div>
      )}

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
            : category
            ? "Atualizar Categoria"
            : "Adicionar Categoria"}
        </button>
      </div>
    </motion.form>
  );
};

export default CategoryForm;
