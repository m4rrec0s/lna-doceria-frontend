import React, { useState, FormEvent, useEffect, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { 
  FolderHeart, 
  Trash2, 
  Plus, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  Candy
} from "lucide-react";
import Image from "next/image";

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
      imageUrl?: string | null; // helper to show existing image preview
      status: "new" | "edited" | "deleted" | "clean";
    }[]
  >([]);
  
  const [newFlavorName, setNewFlavorName] = useState("");
  const [newFlavorImage, setNewFlavorImage] = useState<File | null>(null);
  const [newFlavorImagePreview, setNewFlavorImagePreview] = useState<string | null>(null);

  const newFlavorFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      name: category?.name || "",
    });
    setFlavorsDraft(
      (category?.flavors || []).map((flavor) => ({
        id: flavor.id,
        name: flavor.name,
        imageUrl: flavor.imageUrl || null,
        imageFile: null,
        status: "clean" as const,
      }))
    );
  }, [category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewFlavorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, envie apenas arquivos de imagem.");
        return;
      }
      setNewFlavorImage(file);
      const reader = new FileReader();
      reader.onload = () => setNewFlavorImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addFlavorToDraft = () => {
    const name = newFlavorName.trim();
    if (!name) {
      toast.error("Insira o nome do sabor antes de adicionar.");
      return;
    }
    
    setFlavorsDraft((prev) => [
      ...prev,
      { 
        name, 
        imageFile: newFlavorImage, 
        imageUrl: newFlavorImagePreview,
        status: "new" 
      },
    ]);
    
    setNewFlavorName("");
    setNewFlavorImage(null);
    setNewFlavorImagePreview(null);
    toast.success("Sabor adicionado ao rascunho!");
  };

  const removeFlavorDraft = (index: number) => {
    setFlavorsDraft((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "deleted" as const } : f
      )
    );
    toast.success("Sabor marcado para exclusão.");
  };

  const handleFlavorImageChange = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFlavorsDraft((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                imageFile: file,
                imageUrl: reader.result as string,
                status: f.status === "new" ? "new" : "edited",
              }
            : f
        )
      );
    };
    reader.readAsDataURL(file);
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

      setFormData({ name: "" });
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
    <div className="relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/70 p-4 text-center backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-rose-50"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-rose-100 opacity-75"></div>
                <div className="relative h-14 w-14 animate-spin rounded-full border-4 border-zinc-100 border-t-rose-500"></div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-zinc-900">Salvando Categoria</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Estamos registrando os sabores e atualizando o catálogo. Isso pode levar alguns segundos.
              </p>
              <div className="mt-4 text-xs font-semibold text-rose-500 animate-pulse">
                Por favor, aguarde...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {formError && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-650" />
            <div>
              <span className="font-semibold">Erro ao salvar:</span>
              <p className="mt-1">{formError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Card 1: Detalhes da Categoria */}
          <div className="md:col-span-5">
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <FolderHeart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Informações da Categoria</h3>
                  <p className="text-[11px] text-zinc-400">Insira o nome principal do grupo de doces.</p>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Nome da Categoria *
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Tortas Finas, Bolos de Festa..."
                    className="w-full rounded-2xl h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-100 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 2: Sabores Associados e Gerenciador */}
          <div className="md:col-span-7">
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Candy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Sabores Personalizados</h3>
                    <p className="text-[11px] text-zinc-400">Configure os sabores que pertencem a este grupo.</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                
                {/* Uploader Box Novo Sabor */}
                <div className="rounded-3xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-4 shadow-inner">
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">Cadastrar Novo Sabor</span>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome do Sabor</Label>
                      <Input
                        value={newFlavorName}
                        onChange={(e) => setNewFlavorName(e.target.value)}
                        placeholder="Ex: Leite Ninho com Nutella"
                        className="rounded-xl h-10 text-xs bg-white border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foto do Sabor</Label>
                      <input
                        type="file"
                        ref={newFlavorFileRef}
                        accept="image/*"
                        onChange={handleNewFlavorFileChange}
                        className="hidden"
                      />
                      
                      {!newFlavorImagePreview ? (
                        <button
                          type="button"
                          onClick={() => newFlavorFileRef.current?.click()}
                          className="w-full h-10 border border-dashed border-zinc-300 hover:border-rose-400 rounded-xl bg-white text-xs font-medium text-zinc-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5"
                        >
                          <Upload className="h-4 w-4" />
                          Escolher Foto
                        </button>
                      ) : (
                        <div className="flex items-center justify-between p-1 bg-white border border-zinc-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-zinc-100 flex-shrink-0">
                              <Image src={newFlavorImagePreview} alt="Preview" fill className="object-cover" />
                            </div>
                            <span className="text-[11px] text-zinc-700 font-semibold truncate max-w-[100px]">{newFlavorImage?.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewFlavorImage(null);
                              setNewFlavorImagePreview(null);
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addFlavorToDraft}
                    className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Sabor à Lista
                  </button>
                </div>

                {/* Grid de Sabores no Rascunho */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Sabores na Lista ({flavorsDraft.filter((item) => item.status !== "deleted").length})
                  </span>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {flavorsDraft
                      .map((item, index) => {
                        if (item.status === "deleted") return null;
                        const fileInputId = `flavor-file-${index}`;
                        return (
                          <div
                            key={`${item.id || "new"}-${index}`}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white border border-zinc-150 rounded-2xl shadow-sm hover:border-zinc-200 transition"
                          >
                            {/* Imagem do sabor */}
                            <div className="relative h-12 w-12 rounded-xl bg-zinc-50 overflow-hidden border border-zinc-100 flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <Image src={item.imageUrl} alt="Sabor" fill className="object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-zinc-300" />
                              )}
                              <input
                                type="file"
                                id={fileInputId}
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFlavorImageChange(index, file);
                                }}
                                className="hidden"
                              />
                            </div>

                            {/* Detalhes & Nome */}
                            <div className="flex-1 space-y-1.5">
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
                                className="h-9 rounded-xl text-xs font-semibold text-zinc-700 bg-white"
                              />
                            </div>

                            {/* Ações */}
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById(fileInputId)?.click()}
                                className="h-9 px-3 rounded-xl border border-zinc-200 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 flex items-center gap-1"
                                title="Trocar imagem"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Foto
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFlavorDraft(index)}
                                className="h-9 w-9 rounded-xl border border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                                title="Remover Sabor"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {flavorsDraft.filter((item) => item.status !== "deleted").length === 0 && (
                      <div className="p-8 text-center border border-dashed border-zinc-200 rounded-3xl text-xs text-zinc-400 italic bg-zinc-50/30">
                        Nenhum sabor adicionado a esta categoria ainda.
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-150">
          <p className="text-[11px] text-zinc-400 text-center sm:text-left">
            * O nome da categoria é de preenchimento obrigatório para a vitrine.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 h-11 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-sm transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition shadow-lg shadow-rose-600/10 flex items-center justify-center gap-1.5"
            >
              {category ? "Atualizar Categoria" : "Criar Categoria"}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default CategoryForm;
