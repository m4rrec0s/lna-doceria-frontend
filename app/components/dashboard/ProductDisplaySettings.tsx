"use client";

import { useState, useEffect } from "react";
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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
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
  productIds: string | null | undefined;
  active: boolean;
  order: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  tags: string[] | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  category?: string;
  products?: Product[];
}

interface ProductDisplaySettingsProps {
  categories: Category[];
  products: Product[];
}

interface SortableItemProps {
  section: DisplaySection;
  index: number;
  updateSectionTitle: (index: number, title: string) => void;
  updateSectionType: (
    index: number,
    type: "category" | "custom" | "discounted" | "new_arrivals"
  ) => void;
  updateSectionCategory: (index: number, categoryId: string) => void;
  updateSectionDate: (
    index: number,
    dateType: "startDate" | "endDate",
    date: Date | null
  ) => void;
  updateSectionTags: (index: number, tags: string[]) => void;
  toggleProductSelection: (sectionIndex: number, productId: string) => void;
  toggleSectionActive: (index: number) => void;
  removeSection: (index: number) => void;
  categories: Category[];
  products: Product[];
}

const SortableItem: React.FC<SortableItemProps> = ({
  section,
  index,
  updateSectionTitle,
  updateSectionType,
  updateSectionCategory,
  updateSectionDate,
  updateSectionTags,
  toggleProductSelection,
  toggleSectionActive,
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

  const getSelectedProductsCount = () => {
    if (!Array.isArray(section.productIds)) return 0;
    return section.productIds.length;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border ${
        !section.active ? "bg-gray-50 dark:bg-gray-900/20" : ""
      }`}
    >
      <CardContent className="p-4">
        {/* Seção de cabeçalho */}
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
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500"
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

        {/* Resumo da seção (visível quando recolhido) */}
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
                <strong>Produtos:</strong> {getSelectedProductsCount()}
              </div>
            )}
            <div className="flex items-center">
              <Checkbox
                id={`active-${section.id}-collapsed`}
                checked={section.active}
                onCheckedChange={() => toggleSectionActive(index)}
                className="mr-2"
              />
              <Label htmlFor={`active-${section.id}-collapsed`}>Ativo</Label>
            </div>
          </div>
        )}

        {/* Detalhes expandidos */}
        {isExpanded && (
          <>
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`active-${section.id}`}
                  checked={section.active}
                  onCheckedChange={() => toggleSectionActive(index)}
                />
                <Label htmlFor={`active-${section.id}`}>Seção ativa</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${section.id}`}>Título da Seção</Label>
                  <Input
                    id={`title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSectionTitle(index, e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`type-${section.id}`}>Tipo de Seção</Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) =>
                      updateSectionType(
                        index,
                        value as
                          | "category"
                          | "custom"
                          | "discounted"
                          | "new_arrivals"
                      )
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
                      <SelectItem value="new_arrivals">
                        Produtos Novos
                      </SelectItem>
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
                      updateSectionDate(index, "startDate", date);
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
                      updateSectionDate(index, "endDate", date);
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
                  value={
                    Array.isArray(section.tags) ? section.tags.join(", ") : ""
                  }
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    updateSectionTags(index, tags);
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
                      updateSectionCategory(index, value)
                    }
                  >
                    <SelectTrigger id={`category-${section.id}`}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : section.type === "discounted" ? (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Produtos com desconto são adicionados automaticamente. A
                    seção exibirá todos os produtos com desconto ativo.
                  </p>
                </div>
              ) : section.type === "new_arrivals" ? (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Produtos novos (últimos 30 dias) são adicionados
                    automaticamente. A seção exibirá os produtos adicionados nos
                    últimos 30 dias.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Selecionar Produtos
                    <span className="text-xs text-gray-500">
                      {getSelectedProductsCount()} produto(s) selecionado(s)
                    </span>
                  </Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {products.map((product: Product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-900 rounded"
                        >
                          <Checkbox
                            id={`product-${section.id}-${product.id}`}
                            checked={
                              Array.isArray(section.productIds) &&
                              section.productIds.includes(product.id)
                            }
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
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ProductDisplaySettings = ({
  categories,
  products,
}: ProductDisplaySettingsProps) => {
  const {
    getDisplaySettings,
    createDisplaySection,
    updateDisplaySection,
    updateAllSectionsApi,
    deleteDisplaySection,
  } = useApi();

  const [sections, setSections] = useState<DisplaySection[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<{
    type: "create" | "update" | "delete" | "none";
    sectionId?: string;
    index?: number;
    status: "idle" | "loading" | "success" | "error";
  }>({ type: "none", status: "idle" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const savedSettings = await getDisplaySettings();
        if (savedSettings && Array.isArray(savedSettings)) {
          const parsedSettings = savedSettings.map((section) => ({
            ...section,
            productIds:
              section.productIds && typeof section.productIds === "string"
                ? JSON.parse(section.productIds)
                : [],
            tags:
              section.tags && typeof section.tags === "string"
                ? JSON.parse(section.tags)
                : [],
          }));
          setSections(parsedSettings);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Não foi possível carregar as configurações");
      } finally {
        setLoading(false);
      }
    };

    let isMounted = true;
    if (isMounted) {
      loadSettings();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAllDisplaySections = async (
    sectionsToUpdate: DisplaySection[]
  ) => {
    setLoading(true);
    try {
      const payload = sectionsToUpdate.map((section, index) => ({
        ...section,
        order: index,
        productIds: Array.isArray(section.productIds) ? section.productIds : [],
        tags: Array.isArray(section.tags) ? section.tags : [],
      }));
      await updateAllSectionsApi(payload);
      toast.success("Seções atualizadas com sucesso");
      await reloadSections();
    } catch (error) {
      toast.error(`Erro ao atualizar seções: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const reloadSections = async () => {
    setLoading(true);
    try {
      const savedSettings = await getDisplaySettings();
      if (savedSettings && Array.isArray(savedSettings)) {
        const parsedSettings = savedSettings.map((section) => ({
          ...section,
          productIds:
            section.productIds && typeof section.productIds === "string"
              ? JSON.parse(section.productIds)
              : [],
          tags:
            section.tags && typeof section.tags === "string"
              ? JSON.parse(section.tags)
              : [],
        }));
        setSections(parsedSettings);
      }
    } catch (error) {
      toast.error("Erro ao recarregar seções" + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addNewSection = async () => {
    setCurrentOperation({ type: "create", status: "loading" });
    try {
      const newSection = {
        title: "Nova Seção",
        type: "category" as const,
        active: true,
        order: sections.length,
        productIds: JSON.stringify([]),
        tags: JSON.stringify([]),
        startDate: null as Date | null,
        endDate: null as Date | null,
      };
      await createDisplaySection(newSection);
      setCurrentOperation({ type: "create", status: "success" });
      toast.success("Nova seção criada com sucesso");
      await reloadSections();
    } catch (error) {
      toast.error("Erro ao criar nova seção" + (error as Error).message);
      setCurrentOperation({ type: "create", status: "error" });
    }
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updatedSections = [...sections];
    updatedSections[index].title = title;
    setSections(updatedSections);
  };

  const updateSectionType = (
    index: number,
    type: "category" | "custom" | "discounted" | "new_arrivals"
  ) => {
    const updatedSections = [...sections];
    updatedSections[index].type = type;
    if (type === "category") {
      updatedSections[index].productIds = "[]";
    } else {
      updatedSections[index].categoryId = undefined;
    }
    setSections(updatedSections);
  };

  const updateSectionCategory = (index: number, categoryId: string) => {
    const updatedSections = [...sections];
    updatedSections[index].categoryId = categoryId;
    setSections(updatedSections);
  };

  const updateSectionDate = (
    index: number,
    dateType: "startDate" | "endDate",
    date: Date | null
  ) => {
    const updatedSections = [...sections];
    updatedSections[index][dateType] = date;
    setSections(updatedSections);
  };

  const updateSectionTags = (index: number, tags: string[]) => {
    const updatedSections = [...sections];
    updatedSections[index].tags = tags;
    setSections(updatedSections);
  };

  const toggleProductSelection = (sectionIndex: number, productId: string) => {
    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];

    // Garantir que section.productIds seja tratado corretamente, independentemente do formato
    let productIdsArray: string[] = [];

    // Verificar se é um array diretamente
    if (Array.isArray(section.productIds)) {
      productIdsArray = section.productIds;
    }
    // Se for string, tentar fazer o parse
    else if (typeof section.productIds === "string") {
      try {
        productIdsArray = JSON.parse(section.productIds);
        // Garantir que o resultado é um array
        if (!Array.isArray(productIdsArray)) {
          productIdsArray = [];
        }
      } catch (error) {
        console.error("Erro ao processar productIds:", error);
        productIdsArray = [];
      }
    }

    // Alternar a seleção do produto
    if (productIdsArray.includes(productId)) {
      productIdsArray = productIdsArray.filter((id) => id !== productId);
    } else {
      productIdsArray.push(productId);
    }

    // Atualizar section.productIds com o novo array
    section.productIds = JSON.stringify(productIdsArray);

    setSections(updatedSections);
  };

  const toggleSectionActive = (index: number) => {
    const updatedSections = [...sections];
    updatedSections[index].active = !updatedSections[index].active;
    setSections(updatedSections);
  };

  const removeSection = async (index: number) => {
    const sectionToDelete = sections[index];

    if (!sectionToDelete.id || sectionToDelete.id.startsWith("section-")) {
      const updatedSections = [...sections];
      updatedSections.splice(index, 1);
      setSections(updatedSections);
      return;
    }

    if (
      !confirm(
        `Tem certeza que deseja excluir a seção "${sectionToDelete.title}"?`
      )
    ) {
      return;
    }

    setCurrentOperation({
      type: "delete",
      sectionId: sectionToDelete.id,
      index,
      status: "loading",
    });
    try {
      await deleteDisplaySection(sectionToDelete.id);
      const updatedSections = [...sections];
      updatedSections.splice(index, 1);
      setSections(updatedSections);
      setCurrentOperation({ type: "delete", status: "success" });
      toast.success("Seção excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir seção:", error);
      toast.error("Erro ao excluir seção");
      setCurrentOperation({ type: "delete", status: "error" });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveSection = async (index: number) => {
    const section = sections[index];
    if (!section) return;

    setCurrentOperation({
      type: "update",
      sectionId: section.id,
      index,
      status: "loading",
    });

    try {
      const sectionData = {
        title: section.title,
        type: section.type,
        active: section.active,
        categoryId: section.categoryId || null,
        order: index,
        startDate: section.startDate ? new Date(section.startDate) : null,
        endDate: section.endDate ? new Date(section.endDate) : null,
        productIds: Array.isArray(section.productIds) ? section.productIds : [],
        tags: Array.isArray(section.tags) ? section.tags : [],
      };

      await updateDisplaySection(section.id, {
        ...sectionData,
        productIds: JSON.stringify(sectionData.productIds),
        tags: JSON.stringify(sectionData.tags),
      });
      setCurrentOperation({
        type: "update",
        sectionId: section.id,
        index,
        status: "success",
      });
      toast.success(`Seção "${section.title}" atualizada com sucesso`);
    } catch (error) {
      console.error("Erro ao atualizar seção:", error);
      toast.error("Erro ao atualizar seção");
      setCurrentOperation({
        type: "update",
        sectionId: section.id,
        index,
        status: "error",
      });
    }
  };

  const saveAllSections = async () => {
    await updateAllDisplaySections(sections);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Seções da Página Inicial</h3>
          <p className="text-sm text-gray-500">
            Configure as seções de produtos que serão exibidas na página
            inicial.
          </p>
        </div>
        <Button onClick={addNewSection} className="flex items-center gap-2">
          <Plus size={16} /> Adicionar Seção
        </Button>
      </div>

      <div className="mt-6">
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
                <div key={section.id} className="space-y-2">
                  <SortableItem
                    section={section}
                    index={index}
                    updateSectionTitle={updateSectionTitle}
                    updateSectionType={updateSectionType}
                    updateSectionCategory={updateSectionCategory}
                    updateSectionDate={updateSectionDate}
                    updateSectionTags={updateSectionTags}
                    toggleProductSelection={toggleProductSelection}
                    toggleSectionActive={toggleSectionActive}
                    removeSection={removeSection}
                    categories={categories}
                    products={products}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSection(index)}
                      size="sm"
                      disabled={
                        loading ||
                        (currentOperation.status === "loading" &&
                          currentOperation.type === "update" &&
                          currentOperation.index === index)
                      }
                      variant="outline"
                    >
                      {currentOperation.status === "loading" &&
                      currentOperation.type === "update" &&
                      currentOperation.index === index
                        ? "Salvando..."
                        : "Salvar Seção"}
                    </Button>
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <p className="text-gray-500">
                    Nenhuma seção configurada. Clique em &quot;Adicionar
                    Seção&quot; para começar.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {sections.length > 1 && (
        <CardFooter className="flex justify-between pt-4 border-t">
          <Button
            onClick={saveAllSections}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Salvando..." : "Salvar Todas as Seções"}
          </Button>
        </CardFooter>
      )}
    </div>
  );
};

export default ProductDisplaySettings;
