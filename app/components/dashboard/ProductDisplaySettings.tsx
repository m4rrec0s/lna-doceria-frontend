/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Product } from "../../types/product";
import { Category } from "../../types/category";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Tag, 
  FolderHeart, 
  Sparkles,
  Eye,
  EyeOff,
  Search,
  Check,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface DisplaySection {
  id: string;
  title: string;
  type:
    | "category"
    | "category_grams"
    | "custom"
    | "discounted"
    | "new_arrivals";
  categoryId?: string | null;
  productIds: string[];
  gramsOptions?: number[];
  active: boolean;
  order: number;
  startDate?: Date | null;
  endDate?: Date | null;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  category?: Category;
  products?: Product[];
}

interface ProductDisplaySettingsProps {
  categories: Category[];
  products: Product[];
}

const SortableItem: React.FC<{
  section: DisplaySection;
  index: number;
  updateSection: (index: number, updates: Partial<DisplaySection>) => void;
  toggleProductSelection: (sectionIndex: number, productId: string) => void;
  removeSection: (index: number) => void;
  categories: Category[];
  products: Product[];
}> = ({
  section,
  index,
  updateSection,
  toggleProductSelection,
  removeSection,
  categories,
  products,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedStartDate = section.startDate
    ? new Date(section.startDate).toISOString().split("T")[0]
    : "";
  const formattedEndDate = section.endDate
    ? new Date(section.endDate).toISOString().split("T")[0]
    : "";

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "category":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      case "custom":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50";
      case "category_grams":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
      case "discounted":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50";
      case "new_arrivals":
        return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "category":
        return "Categoria";
      case "custom":
        return "Manual (Custom)";
      case "category_grams":
        return "Categoria + Peso";
      case "discounted":
        return "Em Promoção";
      case "new_arrivals":
        return "Lançamentos";
      default:
        return type;
    }
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Nenhuma";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Categoria não encontrada";
  };

  const selectedProductsCount = useMemo(
    () => section.productIds.length,
    [section.productIds],
  );

  // Filter products by search term for Custom lists
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-3xl border transition duration-200 ${
        isDragging 
          ? "border-rose-300 shadow-xl bg-white dark:bg-zinc-900 z-10 scale-[1.01]" 
          : !section.active 
            ? "border-zinc-150 bg-zinc-50/50 opacity-75"
            : "border-zinc-200 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Wider touch friendly drag trigger */}
            <div
              className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} className="text-zinc-400" />
            </div>

            <div className="min-w-0">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1 ${getTypeStyle(section.type)}`}>
                {getTypeLabel(section.type)}
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 truncate text-sm sm:text-base leading-tight">
                {section.title || "Seção Sem Nome"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Recolher
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Editar
                  <ChevronDown size={14} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="h-9 w-9 rounded-xl border border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Collapsed Details Snippet */}
        {!isExpanded && (
          <div className="mt-3 pl-12 text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-zinc-100 pt-2.5">
            {section.type === "category" && (
              <div>
                <span className="font-bold text-zinc-700">Categoria:</span> {getCategoryName(section.categoryId)}
              </div>
            )}
            {section.type === "custom" && (
              <div>
                <span className="font-bold text-zinc-700">Produtos:</span> {selectedProductsCount} selecionados
              </div>
            )}
            {section.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag size={12} className="text-zinc-400" />
                <span>{section.tags.join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-1 font-semibold">
              {section.active ? (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <Eye size={12} />
                  Ativo na Loja
                </span>
              ) : (
                <span className="text-zinc-400 flex items-center gap-0.5">
                  <EyeOff size={12} />
                  Inativo
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-zinc-100 space-y-4 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateSection(index, { active: !section.active })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    section.active 
                      ? "bg-rose-50 border-rose-200 text-rose-800" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  {section.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  Seção ativa na Loja
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`title-${section.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Título de Exibição
                  </Label>
                  <Input
                    id={`title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                    className="rounded-xl h-10 text-xs border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`type-${section.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Tipo de Seleção
                  </Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) =>
                      updateSection(index, {
                        type: value as DisplaySection["type"],
                      })
                    }
                  >
                    <SelectTrigger id={`type-${section.id}`} className="rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Filtrar por Categoria</SelectItem>
                      <SelectItem value="category_grams">Categoria + Peso</SelectItem>
                      <SelectItem value="custom">Produtos Escolhidos Manualmente</SelectItem>
                      <SelectItem value="discounted">Produtos com Desconto</SelectItem>
                      <SelectItem value="new_arrivals">Lançamentos / Recentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`start-date-${section.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={13} />
                    Data de Início
                  </Label>
                  <Input
                    id={`start-date-${section.id}`}
                    type="date"
                    value={formattedStartDate}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateSection(index, { startDate: date });
                    }}
                    className="rounded-xl h-10 text-xs border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`end-date-${section.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={13} />
                    Data de Término
                  </Label>
                  <Input
                    id={`end-date-${section.id}`}
                    type="date"
                    value={formattedEndDate}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateSection(index, { endDate: date });
                    }}
                    className="rounded-xl h-10 text-xs border-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`tags-${section.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Marcadores (Separados por vírgula)
                </Label>
                <Input
                  id={`tags-${section.id}`}
                  value={section.tags.join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    updateSection(index, { tags });
                  }}
                  placeholder="ex: pascoa, sazonal, destaque"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Dynamic Sub-sections based on type */}
              {(section.type === "category" || section.type === "category_grams") && (
                <div className="rounded-3xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`category-${section.id}`} className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Selecione a Categoria Fonte
                    </Label>
                    <Select
                      value={section.categoryId || ""}
                      onValueChange={(value) => updateSection(index, { categoryId: value })}
                    >
                      <SelectTrigger id={`category-${section.id}`} className="rounded-xl h-10 text-xs bg-white">
                        <SelectValue placeholder="Escolha uma categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {section.type === "category_grams" && (
                    <div className="space-y-1.5">
                      <Label htmlFor={`grams-${section.id}`} className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Opções de Peso (Gramas separadas por vírgula)
                      </Label>
                      <Input
                        id={`grams-${section.id}`}
                        value={(section.gramsOptions || []).join(", ")}
                        onChange={(e) => {
                          const gramsOptions = e.target.value
                            .split(",")
                            .map((item) => Number(item.trim()))
                            .filter((item) => !Number.isNaN(item) && item > 0);
                          updateSection(index, { gramsOptions });
                        }}
                        placeholder="ex: 100, 250, 500"
                        className="rounded-xl h-10 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {section.type === "custom" && (
                <div className="rounded-3xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Vincular Doces a esta Vitrine
                    </Label>
                    <span className="text-[10px] font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full text-rose-700">
                      {selectedProductsCount} selecionados
                    </span>
                  </div>

                  {/* search input for filtering products */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                    <Input
                      type="text"
                      placeholder="Pesquisar doce..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8.5 rounded-xl h-9 text-xs bg-white border-zinc-200"
                    />
                  </div>

                  {/* List container */}
                  <div className="border border-zinc-150 rounded-2xl p-2.5 max-h-56 overflow-y-auto bg-white scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredProducts.map((product) => {
                        const isSelected = section.productIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProductSelection(index, product.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left text-xs transition duration-150 ${
                              isSelected
                                ? "bg-rose-50/50 border-rose-200 text-rose-800 font-semibold"
                                : "bg-white border-zinc-100 hover:bg-zinc-50 text-zinc-600"
                            }`}
                          >
                            <span className="truncate pr-2">{product.name}</span>
                            <span className={`h-4.5 w-4.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                              isSelected 
                                ? "bg-rose-500 border-rose-500 text-white" 
                                : "border-zinc-300"
                            }`}>
                              {isSelected && <Check size={10} className="stroke-[4px]" />}
                            </span>
                          </button>
                        );
                      })}

                      {filteredProducts.length === 0 && (
                        <p className="text-xs text-zinc-400 italic py-4 text-center col-span-2">
                          Nenhum doce encontrado para &quot;{searchTerm}&quot;.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductDisplaySettings: React.FC<ProductDisplaySettingsProps> = ({
  categories,
  products,
}) => {
  const {
    getDisplaySettings,
    createDisplaySection,
    updateAllSectionsApi,
    deleteDisplaySection,
  } = useApi();
  const [sections, setSections] = useState<DisplaySection[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalSections, setTotalSections] = useState(0);

  const loadSettings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getDisplaySettings({ page, limit: 20 });

      const normalizedSections = response.sections.map((section) => ({
        ...section,
        productIds: Array.isArray(section.productIds) ? section.productIds : [],
        tags: Array.isArray(section.tags) ? section.tags : [],
        gramsOptions: Array.isArray(section.gramsOptions)
          ? section.gramsOptions
          : [],
      }));

      if (page === 1) {
        setSections(normalizedSections);
      } else {
        setSections((prev) => [...prev, ...normalizedSections]);
      }

      const hasMoreSections = normalizedSections.length >= 20;
      setHasMore(hasMoreSections);
      setTotalSections(sections.length + normalizedSections.length);
      setCurrentPage(page);
    } catch (error) {
      toast.error(
        "Não foi possível carregar as configurações: " +
          (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSection = (index: number, updates: Partial<DisplaySection>) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, ...updates } : section,
      ),
    );
  };

  const toggleProductSelection = (sectionIndex: number, productId: string) => {
    setSections((prev) => {
      const section = prev[sectionIndex];
      const productIds = section.productIds.includes(productId)
        ? section.productIds.filter((id) => id !== productId)
        : [...section.productIds, productId];
      return prev.map((s, i) =>
        i === sectionIndex ? { ...s, productIds } : s,
      );
    });
  };

  const removeSection = async (index: number) => {
    const section = sections[index];
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a seção "${section.title}"?`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteDisplaySection(section.id);
      setSections((prev) => prev.filter((_, i) => i !== index));
      toast.success("Seção excluída com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir seção: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);

        return reorderedItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const addNewSection = async () => {
    try {
      setLoading(true);

      const newSection = {
        title: "Nova Seção de Vitrine",
        type: "category" as const,
        active: true,
        productIds: null,
        tags: "[]",
        gramsOptions: [],
        order: sections.length,
      };

      const createdSection = await createDisplaySection(newSection);
      setSections((prev) => [
        ...prev,
        {
          ...createdSection,
          productIds: [],
          tags: [],
        },
      ]);

      toast.success("Nova vitrine criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar seção: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveAllSections = async () => {
    try {
      setLoading(true);

      const sectionsWithOrder = sections.map((section, index) => {
        const { category, products, ...sectionData } = section;

        return {
          ...sectionData,
          order: index,
        };
      });

      await updateAllSectionsApi(sectionsWithOrder);
      toast.success("Vitrine salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar seções: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSections = () => {
    if (hasMore && !loading) {
      loadSettings(currentPage + 1);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="space-y-6 p-4 rounded-3xl border border-zinc-150 bg-white dark:bg-zinc-950 relative overflow-hidden">
      {/* Overlay feedback */}
      <AnimatePresence>
        {loading && sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mb-2"></div>
            <p className="text-xs font-semibold text-zinc-650">Atualizando vitrine...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            Seções da Vitrine Inicial
          </h3>
          <p className="text-xs text-zinc-450 mt-1">
            Reordene segurando o marcador de arrasto, crie novos filtros dinâmicos ou escolha produtos específicos.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => loadSettings(1)}
            disabled={loading}
            size="sm"
            className="h-10 rounded-xl text-xs border-zinc-250 font-semibold"
          >
            <RefreshCw size={13} className="mr-1" />
            Atualizar
          </Button>
          <Button
            onClick={addNewSection}
            disabled={loading}
            size="sm"
            className="h-10 rounded-xl text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
          >
            <Plus size={14} className="mr-1" />
            Nova Seção
          </Button>
        </div>
      </div>

      {loading && sections.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-zinc-100 border-t-rose-500"></div>
          <p className="mt-3 text-xs font-semibold text-zinc-600">Buscando vitrines...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
          <FolderOpen className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700">Nenhuma seção cadastrada</p>
          <p className="text-xs text-zinc-400 mt-1">Sua página inicial está vazia. Comece criando uma seção.</p>
          <Button onClick={addNewSection} className="mt-4 bg-rose-600 hover:bg-rose-500">
            <Plus size={16} className="mr-2" /> Criar Primeira Seção
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section, index) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  index={index}
                  updateSection={updateSection}
                  toggleProductSelection={toggleProductSelection}
                  removeSection={removeSection}
                  categories={categories}
                  products={products}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            onClick={loadMoreSections}
            disabled={loading}
            size="sm"
            className="rounded-xl"
          >
            {loading ? "Carregando..." : "Carregar Mais Seções"}
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100">
        <p className="text-xs text-zinc-450 text-center sm:text-left">
          Lembre-se de salvar para persistir a nova ordem ou as configurações alteradas.
        </p>
        <Button
          onClick={saveAllSections}
          disabled={loading || sections.length === 0}
          className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/10"
        >
          {loading ? "Salvando..." : "Salvar Todas as Seções"}
        </Button>
      </div>
    </div>
  );
};

export default ProductDisplaySettings;
