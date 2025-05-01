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
import { GripVertical, Plus, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";
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
  type: "category" | "custom" | "discounted" | "new_arrivals";
  categoryId?: string | null;
  productIds: string[];
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "category":
        return "Categoria";
      case "custom":
        return "Produtos Personalizados";
      case "discounted":
        return "Produtos com Desconto";
      case "new_arrivals":
        return "Produtos Novos";
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
    [section.productIds]
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border mb-4 ${
        !section.active ? "bg-gray-50 dark:bg-gray-900/20" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="cursor-move p-1" {...attributes} {...listeners}>
              <GripVertical size={20} className="text-gray-500" />
            </div>
            <div className="font-medium truncate">
              {section.title || "Sem título"}
            </div>
            {!section.active && (
              <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                Inativo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {!isExpanded && (
          <div className="mt-2 pl-8 text-sm text-gray-500 grid grid-cols-3 gap-2">
            <div>
              <strong>Tipo:</strong> {getTypeLabel(section.type)}
            </div>
            {section.type === "category" && (
              <div>
                <strong>Categoria:</strong>{" "}
                {getCategoryName(section.categoryId)}
              </div>
            )}
            {section.type === "custom" && (
              <div>
                <strong>Produtos:</strong> {selectedProductsCount}
              </div>
            )}
            <div className="flex items-center">
              <Checkbox
                id={`active-${section.id}-collapsed`}
                checked={section.active}
                onCheckedChange={(checked) =>
                  updateSection(index, { active: checked === true })
                }
                className="mr-2"
              />
              <Label htmlFor={`active-${section.id}-collapsed`}>Ativo</Label>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id={`active-${section.id}`}
                checked={section.active}
                onCheckedChange={(checked) =>
                  updateSection(index, { active: checked === true })
                }
              />
              <Label htmlFor={`active-${section.id}`}>Seção ativa</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${section.id}`}>Título da Seção</Label>
                <Input
                  id={`title-${section.id}`}
                  value={section.title}
                  onChange={(e) =>
                    updateSection(index, { title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`type-${section.id}`}>Tipo de Seção</Label>
                <Select
                  value={section.type}
                  onValueChange={(value) =>
                    updateSection(index, {
                      type: value as DisplaySection["type"],
                    })
                  }
                >
                  <SelectTrigger id={`type-${section.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Categoria</SelectItem>
                    <SelectItem value="custom">
                      Produtos Personalizados
                    </SelectItem>
                    <SelectItem value="discounted">
                      Produtos com Desconto
                    </SelectItem>
                    <SelectItem value="new_arrivals">Produtos Novos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`start-date-${section.id}`}>
                  Data de Início
                </Label>
                <Input
                  id={`start-date-${section.id}`}
                  type="date"
                  value={formattedStartDate}
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    updateSection(index, { startDate: date });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-date-${section.id}`}>
                  Data de Término
                </Label>
                <Input
                  id={`end-date-${section.id}`}
                  type="date"
                  value={formattedEndDate}
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    updateSection(index, { endDate: date });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`tags-${section.id}`}>
                Tags (separadas por vírgula)
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
              />
            </div>
            {section.type === "category" ? (
              <div className="space-y-2">
                <Label htmlFor={`category-${section.id}`}>
                  Selecionar Categoria
                </Label>
                <Select
                  value={section.categoryId || ""}
                  onValueChange={(value) =>
                    updateSection(index, { categoryId: value })
                  }
                >
                  <SelectTrigger id={`category-${section.id}`}>
                    <SelectValue placeholder="Selecione uma categoria" />
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
            ) : section.type === "custom" ? (
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Selecionar Produtos
                  <span className="text-xs text-gray-500">
                    {selectedProductsCount} produto(s) selecionado(s)
                  </span>
                </Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-900 rounded"
                      >
                        <Checkbox
                          id={`product-${section.id}-${product.id}`}
                          checked={section.productIds.includes(product.id)}
                          onCheckedChange={() =>
                            toggleProductSelection(index, product.id)
                          }
                        />
                        <Label
                          htmlFor={`product-${section.id}-${product.id}`}
                          className="text-sm cursor-pointer flex-grow"
                        >
                          {product.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
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

      // Normalize sections so productIds and tags are always arrays
      const normalizedSections = response.sections.map((section) => ({
        ...section,
        productIds: Array.isArray(section.productIds) ? section.productIds : [],
        tags: Array.isArray(section.tags) ? section.tags : [],
      }));

      if (page === 1) {
        setSections(normalizedSections);
      } else {
        setSections((prev) => [...prev, ...normalizedSections]);
      }

      setHasMore(response.hasMore);
      setTotalSections(response.total);
      setCurrentPage(page);
    } catch (error) {
      toast.error(
        "Não foi possível carregar as configurações: " +
          (error as Error).message
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
        i === index ? { ...section, ...updates } : section
      )
    );
  };

  const toggleProductSelection = (sectionIndex: number, productId: string) => {
    setSections((prev) => {
      const section = prev[sectionIndex];
      const productIds = section.productIds.includes(productId)
        ? section.productIds.filter((id) => id !== productId)
        : [...section.productIds, productId];
      return prev.map((s, i) =>
        i === sectionIndex ? { ...s, productIds } : s
      );
    });
  };

  const removeSection = async (index: number) => {
    const section = sections[index];
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a seção "${section.title}"?`
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

        // Atualiza a ordem das seções
        const reorderedItems = arrayMove(items, oldIndex, newIndex);

        // Atualiza o campo "order" de cada seção
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
        title: "Nova Seção",
        type: "category" as const,
        active: true,
        productIds: null,
        tags: "[]",
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

      toast.success("Nova seção criada com sucesso");
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
        // Extract all properties except category and products which cause type conflicts
        const { category, products, ...sectionData } = section;

        return {
          ...sectionData,
          order: index,
        };
      });

      await updateAllSectionsApi(sectionsWithOrder);
      toast.success("Seções atualizadas com sucesso");
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

  const refreshSections = () => {
    loadSettings(1);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-950 rounded-lg shadow">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div>
          <h3 className="text-lg font-medium">Seções da Página Inicial</h3>
          <p className="text-sm text-gray-500">
            Configure as seções de produtos que serão exibidas na página
            inicial.
            {totalSections > 0 && (
              <span className="ml-2">
                {sections.length} de {totalSections} seções carregadas
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={refreshSections}
            disabled={loading}
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
          <Button onClick={addNewSection} disabled={loading}>
            <Plus size={16} className="mr-2" /> Adicionar Seção
          </Button>
        </div>
      </div>

      {loading && sections.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-500">Carregando seções...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-gray-500">Nenhuma seção encontrada</p>
          <Button onClick={addNewSection} className="mt-4">
            <Plus size={16} className="mr-2" /> Criar primeira seção
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
            <div className="space-y-4">
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
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={loadMoreSections}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Carregar mais seções"}
          </Button>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={saveAllSections}
          disabled={loading || sections.length === 0}
          size="lg"
          className="px-8"
        >
          {loading ? "Salvando..." : "Salvar Todas as Seções"}
        </Button>
      </div>
    </div>
  );
};

export default ProductDisplaySettings;
