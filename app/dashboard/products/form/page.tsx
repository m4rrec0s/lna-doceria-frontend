"use client";

import { FormEvent, useEffect, useMemo, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/app/hooks/useApi";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import ProductForm from "@/app/components/dashboard/ProductForm";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ImageIcon, 
  DollarSign, 
  Sliders, 
  Upload, 
  Trash2, 
  Plus, 
  Scale, 
  PackageOpen, 
  Check, 
  Sparkles, 
  Info,
  X
} from "lucide-react";

export default function ProductFormPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-6 p-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Carregando formulário</span>
            <h1 className="text-3xl font-bold text-zinc-900">Por favor, aguarde...</h1>
          </div>
          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        </div>
      }
    >
      <ProductFormContent />
    </Suspense>
  );
}

function ProductFormContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const router = useRouter();
  const { categories, getCategories, getProductById, updateProduct, loading } =
    useApi();

  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    categoryIds: [] as string[],
    minFlavors: "0",
    maxFlavors: "0",
    packagePrices: [] as {
      quantity: number;
      price: string;
      discount: string;
    }[],
    gramsPrices: [] as { quantity: number; price: string; discount: string }[],
  });
  
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // Dynamic pricing inputs
  const [packageQuantityInput, setPackageQuantityInput] = useState("");
  const [packagePriceInput, setPackagePriceInput] = useState("");
  const [packageDiscountInput, setPackageDiscountInput] = useState("");
  
  const [gramsPriceQuantityInput, setGramsPriceQuantityInput] = useState("");
  const [gramsPriceValueInput, setGramsPriceValueInput] = useState("");
  const [gramsPriceDiscountInput, setGramsPriceDiscountInput] = useState("");

  // Drag over states
  const [mainDragOver, setMainDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const availableFlavors = useMemo(() => {
    const selectedCategories = (categories || []).filter((cat) =>
      formData.categoryIds.includes(cat.id),
    );
    return selectedCategories
      .flatMap((cat) => cat.flavors || [])
      .filter(
        (flavor, index, self) =>
          self.findIndex((f) => f.id === flavor.id) === index,
      );
  }, [categories, formData.categoryIds]);

  const hasVariablePrices = formData.packagePrices.length > 0 || formData.gramsPrices.length > 0;

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!productId) {
        setIsEditing(false);
        return;
      }
      setIsEditing(true);
      setIsFetchingProduct(true);
      try {
        const product = await getProductById(productId);
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: String(product.price || ""),
          discount: product.discount ? String(product.discount) : "",
          categoryIds: (product.categories || []).map(
            (item: { id: string }) => item.id,
          ),
          minFlavors: String(product.minFlavors ?? 0),
          maxFlavors: String(product.maxFlavors ?? 0),
          packagePrices: (product.packagePrices || []).map(
            (entry: {
              quantity: number;
              price: number;
              discount?: number | null;
            }) => ({
              quantity: Number(entry.quantity),
              price: String(entry.price),
              discount:
                entry.discount === null || entry.discount === undefined
                  ? "0"
                  : String(entry.discount),
            }),
          ),
          gramsPrices: (product.gramsPrices || []).map(
            (entry: {
              quantity: number;
              price: number;
              discount?: number | null;
            }) => ({
              quantity: Number(entry.quantity),
              price: String(entry.price),
              discount:
                entry.discount === null || entry.discount === undefined
                  ? "0"
                  : String(entry.discount),
            }),
          ),
        });
        setImagePreview(product.imageUrl || "");
        setExistingGalleryUrls(
          Array.isArray(product.imageUrls)
            ? product.imageUrls.filter(
                (url: string) => url && url !== product.imageUrl,
              )
            : [],
        );
      } catch {
        toast.error("Não foi possível carregar o produto para edição.");
      } finally {
        setIsFetchingProduct(false);
      }
    };
    run();
  }, [productId]);

  useEffect(() => {
    const objectUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  const processMainFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processMainFile(file);
  };

  const handleMainDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setMainDragOver(true);
  };

  const handleMainDragLeave = () => {
    setMainDragOver(false);
  };

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMainDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processMainFile(file);
  };

  const processGalleryFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`O arquivo ${file.name} não é uma imagem.`);
        return false;
      }
      return true;
    });
    setGalleryFiles((prev) => [...prev, ...validFiles]);
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processGalleryFiles(files);
    e.target.value = "";
  };

  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragOver(true);
  };

  const handleGalleryDragLeave = () => {
    setGalleryDragOver(false);
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    processGalleryFiles(files);
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => {
      const newCategoryIds = checked
        ? [...prev.categoryIds, categoryId]
        : prev.categoryIds.filter((id) => id !== categoryId);
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      
      if (!hasVariablePrices) {
        payload.append("price", String(Number(formData.price)));
      }
      if (!hasVariablePrices && formData.discount) {
        payload.append("discount", String(Number(formData.discount)));
      }
      
      payload.append("minFlavors", String(Number(formData.minFlavors || 0)));
      payload.append("maxFlavors", String(Number(formData.maxFlavors || 0)));
      formData.categoryIds.forEach((id) => payload.append("categoryIds", id));
      
      if (formData.packagePrices.length > 0) {
        payload.append(
          "packagePrices",
          JSON.stringify(
            formData.packagePrices.map((entry) => ({
              quantity: entry.quantity,
              price: Number(entry.price),
              discount: entry.discount ? Number(entry.discount) : null,
            })),
          ),
        );
      }
      
      if (formData.gramsPrices.length > 0) {
        payload.append(
          "gramsOptions",
          JSON.stringify(formData.gramsPrices.map((entry) => entry.quantity)),
        );
        payload.append(
          "gramsPrices",
          JSON.stringify(
            formData.gramsPrices.map((entry) => ({
              quantity: entry.quantity,
              price: Number(entry.price),
              discount: entry.discount ? Number(entry.discount) : null,
            })),
          ),
        );
      }
      
      if (selectedFile) payload.append("image", selectedFile);
      payload.append("imageUrls", JSON.stringify(existingGalleryUrls));
      galleryFiles.forEach((file) => payload.append("images", file));

      await updateProduct(productId, payload);
      toast.success("Produto atualizado com sucesso.");
      router.back();
    } catch {
      toast.error("Erro ao atualizar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to creation form if not editing
  if (!isEditing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Painel de Gerenciamento</span>
          <h1 className="text-3xl font-bold text-zinc-900">Novo Produto</h1>
          <p className="text-sm text-zinc-500">
            Cadastre um produto saboroso definindo valores, imagens de destaque e as categorias dele.
          </p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <ProductForm
            categories={categories || []}
            onSubmitSuccess={() => router.back()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 relative">
      {/* Save loading overlay */}
      <AnimatePresence>
        {(isSubmitting || loading) && (
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
              className="max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-rose-50"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-rose-100 opacity-75 dark:bg-rose-950/30"></div>
                <div className="relative h-14 w-14 animate-spin rounded-full border-4 border-zinc-100 border-t-rose-500"></div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-zinc-950 dark:text-zinc-50">Salvando Alterações</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Estamos enviando as informações editadas e as imagens. Isso pode levar alguns segundos.
              </p>
              <div className="mt-4 text-xs font-semibold text-rose-500 animate-pulse">
                Por favor, aguarde...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Modo de Edição</span>
        <h1 className="text-3xl font-bold text-zinc-900">Editar Produto</h1>
        <p className="text-sm text-zinc-500">Atualize as configurações e fotos do seu doce.</p>
      </div>

      {isFetchingProduct ? (
        <div className="rounded-3xl border border-rose-150 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mb-3"></div>
          <p className="text-sm font-semibold text-zinc-600">Buscando informações do produto...</p>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Coluna Esquerda: Informações Básicas e Preços */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SESSION 1: BASIC DETAILS */}
              <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Informações Básicas</h3>
                    <p className="text-xs text-zinc-500">Nome e descrição do produto na loja.</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      placeholder="Nome do produto"
                      className="w-full rounded-2xl h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-100 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição Detalhada *</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                      rows={4}
                      placeholder="Ingredientes e detalhes no preparo..."
                      className="w-full rounded-2xl p-3 border border-zinc-200 focus:border-rose-400 focus:ring focus:ring-rose-100 focus:ring-opacity-40 text-sm outline-none transition"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SESSION 2: PRICING & OPTIONS */}
              <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Preços & Promoções</h3>
                    <p className="text-xs text-zinc-500">Organize os valores normais e tabelas dinâmicas.</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {hasVariablePrices && (
                    <div className="flex gap-2 rounded-2xl bg-amber-50 border border-amber-250 p-3.5 text-xs text-amber-800">
                      <Info className="h-4 w-4 flex-shrink-0 text-amber-600" />
                      <span>
                        <strong>Modo Preço Dinâmico Ativo!</strong> Preço fixo desativado pois você usa tabelas específicas.
                      </span>
                    </div>
                  )}

                  {/* Preço Fixo e Desconto */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Preço Regular (R$)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">R$</span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, price: e.target.value }))
                          }
                          required={!hasVariablePrices}
                          disabled={hasVariablePrices}
                          placeholder="0.00"
                          className="pl-8 w-full rounded-2xl h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-100 disabled:bg-zinc-50 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="discount" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Desconto (%)</Label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">%</span>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, discount: e.target.value }))
                          }
                          disabled={hasVariablePrices}
                          placeholder="Ex: 10"
                          className="w-full rounded-2xl h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-100 disabled:bg-zinc-50 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preços Especiais por Pacote */}
                  <div className="border-t border-zinc-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <PackageOpen className="h-4 w-4 text-rose-500" />
                        Preços por Pacote (Kit)
                      </span>
                      <span className="text-[10px] text-zinc-450 font-bold">Opcional</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-4">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Quant. (kit)"
                          value={packageQuantityInput}
                          onChange={(e) => setPackageQuantityInput(e.target.value)}
                          className="rounded-xl h-10 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Valor fechado"
                            value={packagePriceInput}
                            onChange={(e) => setPackagePriceInput(e.target.value)}
                            className="rounded-xl h-10 pl-7 text-xs"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="relative">
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">%</span>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Desc."
                            value={packageDiscountInput}
                            onChange={(e) => setPackageDiscountInput(e.target.value)}
                            className="rounded-xl h-10 text-xs"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            const quantity = Number(packageQuantityInput);
                            const price = Number(packagePriceInput);
                            const discount = packageDiscountInput ? Number(packageDiscountInput) : 0;
                            if (!quantity || quantity <= 0 || Number.isNaN(price) || price < 0 || Number.isNaN(discount) || discount < 0 || discount > 100) return;
                            
                            setFormData((prev) => ({
                              ...prev,
                              packagePrices: [
                                ...prev.packagePrices.filter((item) => item.quantity !== quantity),
                                { quantity, price: String(price), discount: String(discount) },
                              ].sort((a, b) => a.quantity - b.quantity),
                            }));
                            setPackageQuantityInput("");
                            setPackagePriceInput("");
                            setPackageDiscountInput("");
                            toast.success("Preço do pacote adicionado.");
                          }}
                          className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lista em Cards */}
                    {formData.packagePrices.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.packagePrices.map((entry) => (
                          <div 
                            key={`pkg-${entry.quantity}`}
                            className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-2xl text-xs hover:border-zinc-250 transition shadow-sm"
                          >
                            <div>
                              <span className="font-bold text-zinc-800">Kit {entry.quantity} unids.</span>
                              <span className="text-zinc-500 block">
                                R$ {Number(entry.price).toFixed(2)} ({entry.discount}% off)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  packagePrices: prev.packagePrices.filter((item) => item.quantity !== entry.quantity),
                                }))
                              }
                              className="text-zinc-400 hover:text-red-500 p-1.5 rounded hover:bg-red-55 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preços Especiais por Gramas */}
                  <div className="border-t border-zinc-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-rose-500" />
                        Preços por Peso (Gramas)
                      </span>
                      <span className="text-[10px] text-zinc-450 font-bold">Opcional</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-4">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Peso (ex: 250)"
                          value={gramsPriceQuantityInput}
                          onChange={(e) => setGramsPriceQuantityInput(e.target.value)}
                          className="rounded-xl h-10 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Valor"
                            value={gramsPriceValueInput}
                            onChange={(e) => setGramsPriceValueInput(e.target.value)}
                            className="rounded-xl h-10 pl-7 text-xs"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="relative">
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">%</span>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Desc."
                            value={gramsPriceDiscountInput}
                            onChange={(e) => setGramsPriceDiscountInput(e.target.value)}
                            className="rounded-xl h-10 text-xs"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            const quantity = Number(gramsPriceQuantityInput);
                            const price = Number(gramsPriceValueInput);
                            const discount = gramsPriceDiscountInput ? Number(gramsPriceDiscountInput) : 0;
                            if (!quantity || quantity <= 0 || Number.isNaN(price) || price < 0 || Number.isNaN(discount) || discount < 0 || discount > 100) return;
                            
                            setFormData((prev) => ({
                              ...prev,
                              gramsPrices: [
                                ...prev.gramsPrices.filter((entry) => entry.quantity !== quantity),
                                { quantity, price: String(price), discount: String(discount) },
                              ],
                            }));
                            setGramsPriceQuantityInput("");
                            setGramsPriceValueInput("");
                            setGramsPriceDiscountInput("");
                            toast.success("Preço por peso adicionado.");
                          }}
                          className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lista Gramas em Cards */}
                    {formData.gramsPrices.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.gramsPrices.map((entry) => (
                          <div 
                            key={`grams-${entry.quantity}`}
                            className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-2xl text-xs hover:border-zinc-250 transition shadow-sm"
                          >
                            <div>
                              <span className="font-bold text-zinc-800">{entry.quantity}g</span>
                              <span className="text-zinc-500 block">
                                R$ {Number(entry.price).toFixed(2)} ({entry.discount}% off)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gramsPrices: prev.gramsPrices.filter((item) => item.quantity !== entry.quantity),
                                }))
                              }
                              className="text-zinc-400 hover:text-red-500 p-1.5 rounded hover:bg-red-55 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita: Imagens, Categorias & Sabores */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* SESSION 3: IMAGES & MEDIA */}
              <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Fotos do Doce</h3>
                    <p className="text-xs text-zinc-500">Mude a capa e as fotos de galeria.</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Capa Principal */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Imagem Principal</Label>
                    
                    <input
                      type="file"
                      ref={mainFileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {!imagePreview ? (
                      <div
                        onDragOver={handleMainDragOver}
                        onDragLeave={handleMainDragLeave}
                        onDrop={handleMainDrop}
                        onClick={() => mainFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition duration-200 ${
                          mainDragOver 
                            ? 'border-rose-400 bg-rose-50/40' 
                            : 'border-zinc-200 hover:border-rose-300 hover:bg-zinc-50/50'
                        }`}
                      >
                        <Upload className="h-6 w-6 text-rose-500" />
                        <p className="text-xs font-semibold text-zinc-800">Selecione uma imagem principal</p>
                      </div>
                    ) : (
                      <div className="relative group rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-video w-full flex items-center justify-center shadow-sm">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => mainFileInputRef.current?.click()}
                            className="h-10 w-10 rounded-full bg-white hover:text-rose-600 flex items-center justify-center shadow-lg transition"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Galeria de Fotos */}
                  <div className="space-y-3 border-t border-zinc-100 pt-6">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Fotos Adicionais (Galeria)</Label>
                    
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleGalleryFilesChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleGalleryDragOver}
                      onDragLeave={handleGalleryDragLeave}
                      onDrop={handleGalleryDrop}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 transition duration-200 ${
                        galleryDragOver 
                          ? 'border-rose-400 bg-rose-50/40' 
                          : 'border-zinc-200 hover:border-rose-300 hover:bg-zinc-50/50'
                      }`}
                    >
                      <Upload className="h-5 w-5 text-zinc-400" />
                      <p className="text-[11px] font-semibold text-zinc-600">Arraste ou clique para adicionar mais fotos</p>
                    </div>

                    {/* Salvas */}
                    {existingGalleryUrls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Imagens já salvas:</span>
                        <div className="flex flex-wrap gap-2">
                          {existingGalleryUrls.map((src, index) => (
                            <div key={`existing-${index}`} className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                              <Image src={src} alt="Galeria salva" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  setExistingGalleryUrls((prev) => prev.filter((_, idx) => idx !== index))
                                }
                                className="absolute -right-1.5 -top-1.5 bg-red-600 text-white rounded-full h-5.5 w-5.5 flex items-center justify-center shadow hover:bg-red-700 transition"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Novas prévias */}
                    {galleryPreviews.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Novas imagens (A salvar):</span>
                        <div className="flex flex-wrap gap-2">
                          {galleryPreviews.map((src, index) => (
                            <div key={`new-pre-${index}`} className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-200 shadow-sm animate-fade-in animate-duration-200">
                              <Image src={src} alt="Galeria nova" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => removeGalleryFile(index)}
                                className="absolute -right-1.5 -top-1.5 bg-red-600 text-white rounded-full h-5.5 w-5.5 flex items-center justify-center shadow hover:bg-red-750 transition"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SESSION 4: CATEGORIES & FLAVORS */}
              <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Categorias & Sabores</h3>
                    <p className="text-xs text-zinc-500">Mude as categorias e as regras de sabores.</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Checklist Modernizado */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categorias Associadas</Label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {categories.map((category) => {
                        const isChecked = formData.categoryIds.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryChange(category.id, !isChecked)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-2xl border text-left text-xs transition duration-205 font-semibold ${
                              isChecked
                                ? "bg-rose-50/60 border-rose-200 text-rose-800 shadow-sm"
                                : "bg-white border-zinc-150 hover:bg-zinc-50 hover:border-zinc-200 text-zinc-700"
                            }`}
                          >
                            <span className="truncate pr-2">{category.name}</span>
                            <span className={`h-4.5 w-4.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                              isChecked ? "bg-rose-500 border-rose-500 text-white scale-105" : "border-zinc-300"
                            }`}>
                              {isChecked && <Check className="h-3 w-3 stroke-[4px]" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Regras de escolha */}
                  {availableFlavors.length > 0 ? (
                    <div className="space-y-4 rounded-3xl border border-rose-100 bg-rose-50/30 p-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Sabores para Escolha do Cliente</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="minFlavors" className="text-[10px] font-bold text-zinc-500">Mínimo de Sabores</Label>
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
                            className="rounded-xl h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="maxFlavors" className="text-[10px] font-bold text-zinc-500">Máximo de Sabores</Label>
                          <Input
                            id="maxFlavors"
                            type="number"
                            min={formData.minFlavors || "0"}
                            max={String(availableFlavors.length)}
                            value={formData.maxFlavors}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxFlavors: e.target.value,
                              }))
                            }
                            className="rounded-xl h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-rose-800 block mb-1.5">Opções de sabores disponíveis ({availableFlavors.length}):</span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {availableFlavors.map((flavor) => (
                            <span 
                              key={`flv-${flavor.id}`} 
                              className="bg-white border border-rose-100 text-[10px] px-2.5 py-1 rounded-full text-rose-700 font-semibold"
                            >
                              {flavor.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : formData.categoryIds.length > 0 && (
                    <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-4 text-xs text-zinc-500 flex gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                      <span>Sem sabores cadastrados nestas categorias. Cadastre sabores na aba Sabores para liberar as regras.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200">
            <p className="text-xs text-zinc-500 text-center sm:text-left">
              Confirme as edições. O site dos clientes atualizará automaticamente.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 h-12 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-sm transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
