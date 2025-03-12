import React, { useState, useEffect, FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { Flavor } from "../../types/flavor";
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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditFlavorDialogProps {
  flavor: Flavor | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditFlavorDialog = ({
  flavor,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: EditFlavorDialogProps) => {
  const { updateFlavor } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
  });

  useEffect(() => {
    if (flavor) {
      setFormData({
        name: flavor.name,
        categoryId: flavor.categoryId || "none", // Use "none" em vez de string vazia
      });
      setImagePreview(flavor.imageUrl || "");
    }
  }, [flavor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!flavor) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());

      if (formData.categoryId && formData.categoryId !== "none") {
        formDataToSend.append("categoryId", formData.categoryId);
      }

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      await updateFlavor(flavor.id, formDataToSend);

      toast.success("Sabor atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar sabor:", error);
      toast.error(
        "Erro ao atualizar sabor. Verifique os dados e tente novamente."
      );
      setFormError(
        "Erro ao atualizar sabor. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Sabor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-4 rounded border border-red-200 text-red-700 mb-4">
              {formError}
            </div>
          )}

          <div>
            <Label
              htmlFor="edit-name"
              className="block text-sm font-medium mb-1"
            >
              Nome do Sabor *
            </Label>
            <Input
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
            <Label
              htmlFor="edit-category"
              className="block text-sm font-medium mb-1"
            >
              Categoria
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="edit-category">
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
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-imageFile"
              className="block text-sm font-medium mb-1"
            >
              Imagem do Sabor
            </Label>
            <Input
              type="file"
              id="edit-imageFile"
              name="imageFile"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900"
            />

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditFlavorDialog };
