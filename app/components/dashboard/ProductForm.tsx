import React, { useState, FormEvent, useEffect, useMemo, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { Category } from "../../types/category";
import { Flavor } from "../../types/flavor";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { 
  Info, 
  Upload, 
  Trash2, 
  Plus, 
  DollarSign, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  Scale, 
  PackageOpen, 
  Check, 
  Sparkles, 
  AlertCircle,
  X
} from "lucide-react";

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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([]);
  const [showFlavorSelection, setShowFlavorSelection] = useState(false);
  
  // Package prices state
  const [packagePrices, setPackagePrices] = useState<
    { quantity: number; price: string; discount: string }[]
  >([]);
  const [packageQuantityInput, setPackageQuantityInput] = useState("");
  const [packagePriceInput, setPackagePriceInput] = useState("");
  const [packageDiscountInput, setPackageDiscountInput] = useState("");
  
  // Grams prices state
  const [gramsPrices, setGramsPrices] = useState<
    { quantity: number; price: string; discount: string }[]
  >([]);
  const [gramsPriceQuantityInput, setGramsPriceQuantityInput] = useState("");
  const [gramsPriceValueInput, setGramsPriceValueInput] = useState("");
  const [gramsPriceDiscountInput, setGramsPriceDiscountInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    categoryIds: [] as string[],
    minFlavors: "0",
    maxFlavors: "0",
  });

  // Uploader drag over states
  const [mainDragOver, setMainDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(() => {
    if (formData.categoryIds.length === 0) return null;
    return categories.filter((cat) => formData.categoryIds.includes(cat.id));
  }, [categories, formData.categoryIds]);

  useEffect(() => {
    const mergedFlavors = (selectedCategory || [])
      .flatMap((category) => category.flavors || [])
      .filter(
        (flavor, index, self) =>
          self.findIndex((f) => f.id === flavor.id) === index,
      );
    const canEnableFlavorRules = mergedFlavors.length > 0;

    setAvailableFlavors(mergedFlavors);
    setShowFlavorSelection(canEnableFlavorRules);

    if (!canEnableFlavorRules) {
      setFormData((prev) =>
        prev.minFlavors === "0" && prev.maxFlavors === "0"
          ? prev
          : { ...prev, minFlavors: "0", maxFlavors: "0" },
      );
    }
  }, [selectedCategory]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => {
      let newCategoryIds;
      if (checked) {
        newCategoryIds = [...prev.categoryIds, categoryId];
      } else {
        newCategoryIds = prev.categoryIds.filter((id) => id !== categoryId);
      }
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const processMainFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie apenas arquivos de imagem.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
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
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`O arquivo ${file.name} não é uma imagem válida.`);
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

  useEffect(() => {
    const objectUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  const removePackagePrice = (quantity: number) => {
    setPackagePrices((prev) =>
      prev.filter((entry) => entry.quantity !== quantity),
    );
  };

  const removeGramsPrice = (quantity: number) => {
    setGramsPrices((prev) =>
      prev.filter((entry) => entry.quantity !== quantity),
    );
  };

  const hasVariablePrices = packagePrices.length > 0 || gramsPrices.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!selectedFile) {
      setFormError("Por favor, selecione a imagem principal do produto.");
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.categoryIds.length === 0) {
      setFormError("Por favor, selecione pelo menos uma categoria.");
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
        setFormError(
          "O máximo de sabores não pode ultrapassar os sabores disponíveis.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      
      if (!hasVariablePrices) {
        formDataToSend.append("price", formData.price.trim());
      }

      if (!hasVariablePrices && formData.discount) {
        formDataToSend.append("discount", formData.discount.trim());
      }

      formData.categoryIds.forEach((categoryId) => {
        formDataToSend.append("categoryIds", categoryId);
      });

      if (showFlavorSelection) {
        formDataToSend.append("minFlavors", formData.minFlavors || "0");
        formDataToSend.append("maxFlavors", formData.maxFlavors || "0");
      }
      
      if (gramsPrices.length > 0) {
        formDataToSend.append(
          "gramsOptions",
          JSON.stringify(gramsPrices.map((entry) => entry.quantity)),
        );
        formDataToSend.append(
          "gramsPrices",
          JSON.stringify(
            gramsPrices.map((entry) => ({
              quantity: entry.quantity,
              price: Number(entry.price),
              discount: entry.discount ? Number(entry.discount) : null,
            })),
          ),
        );
      }
      
      if (packagePrices.length > 0) {
        formDataToSend.append(
          "packagePrices",
          JSON.stringify(
            packagePrices.map((entry) => ({
              quantity: entry.quantity,
              price: Number(entry.price),
              discount: entry.discount ? Number(entry.discount) : null,
            })),
          ),
        );
      }

      formDataToSend.append("image", selectedFile);
      galleryFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      await createProduct(formDataToSend);

      toast.success("Produto adicionado com sucesso!");
      onSubmitSuccess();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto. Verifique os dados.");
      setFormError("Erro ao salvar produto. Verifique os dados e tente novamente.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Dynamic Overlay Loading */}
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
              className="max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-rose-50"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-rose-100 opacity-75 dark:bg-rose-950/30"></div>
                <div className="relative h-14 w-14 animate-spin rounded-full border-4 border-zinc-100 border-t-rose-500"></div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-zinc-950 dark:text-zinc-50">Salvando Produto</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Estamos enviando as informações e imagens para a vitrine. Isso pode levar alguns segundos.
              </p>
              <div className="mt-4 text-xs font-semibold text-rose-500 animate-pulse">
                Por favor, não saia desta página
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        {formError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <span className="font-semibold">Erro no preenchimento:</span>
              <p className="mt-1">{formError}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Informações Gerais */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SESSION 1: BASIC DETAILS */}
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Informações Básicas</h3>
                  <p className="text-xs text-zinc-500">Insira o nome principal e a descrição do produto.</p>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Nome do Produto *
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Bolo Red Velvet Supremo"
                    className="w-full rounded-2xl h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-100 dark:bg-zinc-900 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Descrição Detalhada *
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Descreva os ingredientes, tamanho, rendimento e o carinho no preparo deste doce..."
                    className="w-full rounded-2xl p-3 border border-zinc-200 focus:border-rose-400 focus:ring focus:ring-rose-100 focus:ring-opacity-40 dark:bg-zinc-900 text-sm outline-none transition"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SESSION 2: PRICES & OFFERS */}
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Preços & Promoções</h3>
                  <p className="text-xs text-zinc-500">Defina o preço fixo ou crie faixas por pacote ou peso.</p>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                
                {/* Switch info warning when dynamic price is active */}
                {hasVariablePrices && (
                  <div className="flex gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                    <Info className="h-4 w-4 flex-shrink-0 text-amber-600" />
                    <p>
                      <strong>Modo Preço Dinâmico Ativo!</strong> Como você cadastrou opções de Pacote ou Peso (gramas), o preço fixo regular foi desativado. O sistema usará as tabelas dinâmicas configuradas abaixo.
                    </p>
                  </div>
                )}

                {/* Grid Preço Padrão e Desconto */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Preço Regular (R$)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">R$</span>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required={!hasVariablePrices}
                        disabled={hasVariablePrices}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 w-full rounded-2xl h-11 border-zinc-200 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 focus:border-rose-400 focus:ring-rose-100 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="discount" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Desconto (%)
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">%</span>
                      <Input
                        type="number"
                        id="discount"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        disabled={hasVariablePrices}
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        className="w-full rounded-2xl h-11 border-zinc-200 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 focus:border-rose-400 focus:ring-rose-100 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-sessão: Preços por Pacote (Ex: cento, kit doce...) */}
                <div className="border-t border-zinc-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <PackageOpen className="h-4 w-4 text-rose-500" />
                      Preço Específico por Pacote (Kit/Unidades)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">Opcional</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quant. (ex: 50)"
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
                          placeholder="Valor do kit"
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
                          placeholder="Desconto"
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
                          
                          if (!quantity || quantity <= 0 || Number.isNaN(price) || price < 0 || Number.isNaN(discount) || discount < 0 || discount > 100) {
                            toast.error("Por favor, preencha quantidade e preço corretamente para o pacote.");
                            return;
                          }
                          setPackagePrices((prev) => {
                            const filtered = prev.filter(entry => entry.quantity !== quantity);
                            return [...filtered, { quantity, price: String(price), discount: String(discount) }].sort((a, b) => a.quantity - b.quantity);
                          });
                          setPackageQuantityInput("");
                          setPackagePriceInput("");
                          setPackageDiscountInput("");
                          toast.success("Preço de pacote adicionado à lista!");
                        }}
                        className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de pacotes em Cards responsivos */}
                  {packagePrices.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {packagePrices.map((entry) => (
                        <div 
                          key={`pkg-${entry.quantity}`}
                          className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-150 text-xs transition hover:border-zinc-250 shadow-sm"
                        >
                          <div>
                            <span className="font-bold text-zinc-800 block">Kit {entry.quantity} unids.</span>
                            <span className="text-zinc-500">
                              R$ {Number(entry.price).toFixed(2)}
                              {Number(entry.discount) > 0 && ` (${entry.discount}% OFF)`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePackagePrice(entry.quantity)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-sessão: Preços por peso (Grams) */}
                <div className="border-t border-zinc-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-rose-500" />
                      Preço Específico por Peso (Gramas)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">Opcional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Peso (ex: 250g)"
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
                          placeholder="Valor por este peso"
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
                          placeholder="Desconto"
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
                          
                          if (!quantity || quantity <= 0 || Number.isNaN(price) || price < 0 || Number.isNaN(discount) || discount < 0 || discount > 100) {
                            toast.error("Por favor, preencha peso (gramas) e preço corretamente.");
                            return;
                          }
                          setGramsPrices((prev) => {
                            const filtered = prev.filter(entry => entry.quantity !== quantity);
                            return [...filtered, { quantity, price: String(price), discount: String(discount) }].sort((a, b) => a.quantity - b.quantity);
                          });
                          setGramsPriceQuantityInput("");
                          setGramsPriceValueInput("");
                          setGramsPriceDiscountInput("");
                          toast.success("Preço por peso adicionado!");
                        }}
                        className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de pesos em Cards responsivos */}
                  {gramsPrices.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {gramsPrices.map((entry) => (
                        <div 
                          key={`grams-${entry.quantity}`}
                          className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-150 text-xs transition hover:border-zinc-250 shadow-sm"
                        >
                          <div>
                            <span className="font-bold text-zinc-800 block">Opção {entry.quantity}g</span>
                            <span className="text-zinc-500">
                              R$ {Number(entry.price).toFixed(2)}
                              {Number(entry.discount) > 0 && ` (${entry.discount}% OFF)`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGramsPrice(entry.quantity)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition"
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

          {/* Coluna Direita: Mídias, Categorias & Sabores */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SESSION 3: IMAGES & MEDIA */}
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Imagens do Doce</h3>
                  <p className="text-xs text-zinc-500">Faça o upload da imagem de destaque e galeria de fotos.</p>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                {/* Imagem Principal Custom Uploader Area */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Imagem Principal (Capa) *
                  </Label>
                  
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
                          ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/10' 
                          : 'border-zinc-200 hover:border-rose-300 hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-800">Toque para selecionar imagem</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Ou arraste o arquivo aqui (PNG, JPG de até 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-video w-full flex items-center justify-center">
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
                          className="h-10 w-10 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 text-zinc-800 flex items-center justify-center transition shadow-lg"
                          title="Alterar imagem"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setSelectedFile(null);
                          }}
                          className="h-10 w-10 rounded-full bg-white hover:bg-red-50 hover:text-red-600 text-zinc-800 flex items-center justify-center transition shadow-lg"
                          title="Remover imagem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Imagens Adicionais (Galeria) */}
                <div className="space-y-3 border-t border-zinc-100 pt-6">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    Fotos de Detalhes (Galeria opcional)
                  </Label>
                  
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
                    <p className="text-[11px] font-medium text-zinc-600">Adicionar mais fotos do doce</p>
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 mt-2">
                      {galleryPreviews.map((src, index) => (
                        <div
                          key={`gallery-preview-${index}`}
                          className="relative group h-16 w-16 rounded-xl overflow-hidden border border-zinc-200 animate-fade-in"
                        >
                          <Image
                            src={src}
                            alt={`Galeria ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryFile(index)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SESSION 4: CATEGORIES & FLAVOR RULES */}
            <Card className="border border-zinc-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Categorias & Sabores</h3>
                  <p className="text-xs text-zinc-500">Selecione onde encaixar o produto e ative regras de sabores.</p>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                
                {/* Categorias - Seleção com Mini Cards Interativos */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    Categorias Associadas *
                  </Label>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                    {categories.map((category) => {
                      const isSelected = formData.categoryIds.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryChange(category.id, !isSelected)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-2xl border text-left text-xs transition duration-200 font-semibold ${
                            isSelected
                              ? "bg-rose-50/60 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-300 shadow-sm"
                              : "bg-white border-zinc-150 hover:bg-zinc-50 hover:border-zinc-205 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800"
                          }`}
                        >
                          <span className="truncate pr-2">{category.name}</span>
                          <span className={`h-4.5 w-4.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected 
                              ? "bg-rose-500 border-rose-500 text-white scale-105" 
                              : "border-zinc-300"
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[4px]" />}
                          </span>
                        </button>
                      );
                    })}

                    {categories.length === 0 && (
                      <p className="text-xs text-zinc-500 italic py-2 col-span-2">Nenhuma categoria disponível.</p>
                    )}
                  </div>
                </div>

                {/* Regras de Sabores se houver disponíveis */}
                {showFlavorSelection ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 rounded-3xl border border-rose-100 bg-rose-50/30 p-5 dark:bg-rose-950/10 dark:border-rose-900/40"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                      <p className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                        Escolha de Sabores pelo Cliente
                      </p>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Este produto pertence a categorias que contêm sabores vinculados. Defina quantos sabores o cliente poderá escolher na hora da compra.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
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

                    {/* Badge indicando os sabores disponíveis */}
                    <div className="pt-2 border-t border-rose-100/50">
                      <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold block mb-1.5">
                        Sabores herdados para escolha ({availableFlavors.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {availableFlavors.map(flavor => (
                          <span 
                            key={`flavor-${flavor.id}`}
                            className="bg-white border border-rose-100 text-[10px] px-2.5 py-1 rounded-full text-rose-700 font-semibold shadow-sm hover:scale-105 transition-transform"
                          >
                            {flavor.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : formData.categoryIds.length > 0 && (
                  <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-4 text-xs text-zinc-500 flex gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <span>
                      As regras de sabores personalizados ficarão ativas assim que você selecionar categorias que tenham sabores cadastrados associados.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-500 text-center sm:text-left">
            * Campos marcados com asterisco são obrigatórios para a vitrine.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSubmitSuccess()}
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
              <Plus className="h-4 w-4" />
              Adicionar Produto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
