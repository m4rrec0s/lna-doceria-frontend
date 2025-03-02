import React, { useState, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";

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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const categoryData = {
        name: formData.name,
      };

      if (category) {
        await updateCategory(category.id, categoryData);
      } else {
        await createCategory(categoryData);
      }

      setFormData({
        name: "",
      });
      onSubmitSuccess();
      toast.success("Categoria criada com sucesso!");
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
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nome da Categoria *
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
