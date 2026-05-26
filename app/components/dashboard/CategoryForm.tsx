import React, { useState, FormEvent, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
  const { createCategory, updateCategory, createFlavor, updateFlavor, deleteFlavor } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: category?.name || "",
  });
  const [flavorsDraft, setFlavorsDraft] = useState<
    {
      id?: string;
      name: string;
      imageFile?: File | null;
      status: "new" | "edited" | "deleted" | "clean";
    }[]
  >([]);
  const [newFlavorName, setNewFlavorName] = useState("");
  const [newFlavorImage, setNewFlavorImage] = useState<File | null>(null);

  useEffect(() => {
    setFormData({
      name: category?.name || "",
    });
    setFlavorsDraft(
      (category?.flavors || []).map((flavor) => ({
        id: flavor.id,
        name: flavor.name,
        imageFile: null,
        status: "clean" as const,
      }))
    );
  }, [category]);

  const showAssociatedFlavors =
    category?.flavors && category.flavors.length > 0;

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
        name: formData.name.trim(),
      };

      if (category) {
        const updated = await updateCategory(category.id, categoryData);
        const categoryId = updated.id;
        const changes = flavorsDraft.filter((item) => item.status !== "clean");
        for (const item of changes) {
          if (item.status === "new") {
            const fd = new FormData();
            fd.append("name", item.name.trim());
            fd.append("categoryId", categoryId);
            if (item.imageFile) fd.append("image", item.imageFile);
            await createFlavor(fd);
          }
          if (item.status === "edited" && item.id) {
            const fd = new FormData();
            fd.append("name", item.name.trim());
            fd.append("categoryId", categoryId);
            if (item.imageFile) fd.append("image", item.imageFile);
            await updateFlavor(item.id, fd);
          }
          if (item.status === "deleted" && item.id) {
            await deleteFlavor(item.id);
          }
        }
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const created = await createCategory(categoryData);
        const categoryId = created.id;
        for (const item of flavorsDraft.filter((f) => f.status === "new")) {
          const fd = new FormData();
          fd.append("name", item.name.trim());
          fd.append("categoryId", categoryId);
          if (item.imageFile) fd.append("image", item.imageFile);
          await createFlavor(fd);
        }
        toast.success("Categoria criada com sucesso!");
      }

      setFormData({
        name: "",
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

      <div className="space-y-2">
        <Label className="block text-sm font-medium">Sabores da categoria</Label>
        <div className="flex gap-2">
          <Input
            value={newFlavorName}
            onChange={(e) => setNewFlavorName(e.target.value)}
            placeholder="Novo sabor"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setNewFlavorImage(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => {
              const value = newFlavorName.trim();
              if (!value) return;
              setFlavorsDraft((prev) => [
                ...prev,
                { name: value, imageFile: newFlavorImage, status: "new" },
              ]);
              setNewFlavorName("");
              setNewFlavorImage(null);
            }}
            className="px-3 py-2 rounded-md bg-zinc-900 text-white text-sm"
          >
            +
          </button>
        </div>
        <div className="space-y-2">
          {flavorsDraft
            .filter((item) => item.status !== "deleted")
            .map((item, index) => (
              <div key={`${item.id || "new"}-${index}`} className="flex gap-2">
                <Input
                  value={item.name}
                  onChange={(e) =>
                    setFlavorsDraft((prev) =>
                      prev.map((f, i) =>
                        i === index
                          ? {
                              ...f,
                              name: e.target.value,
                              status: f.status === "new" ? "new" : "edited",
                            }
                          : f
                      )
                    )
                  }
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFlavorsDraft((prev) =>
                      prev.map((f, i) =>
                        i === index
                          ? {
                              ...f,
                              imageFile: e.target.files?.[0] || null,
                              status: f.status === "new" ? "new" : "edited",
                            }
                          : f
                      )
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setFlavorsDraft((prev) =>
                      prev.map((f, i) =>
                        i === index
                          ? { ...f, status: f.id ? "deleted" : "deleted" }
                          : f
                      )
                    )
                  }
                  className="px-3 py-2 rounded-md border text-red-600"
                >
                  x
                </button>
              </div>
            ))}
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
            : category
            ? "Atualizar Categoria"
            : "Adicionar Categoria"}
        </button>
      </div>
    </motion.form>
  );
};

export default CategoryForm;
