"use client";

import { useState, useEffect, useRef } from "react";
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

export interface ProductSection {
  id: string;
  title: string;
  type: "category" | "custom" | "discounted" | "new_arrivals";
  categoryId?: string | null;
  productIds: string | string[];
  active: boolean;
  order: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  tags: string | string[];
}

interface ProductDisplaySettingsProps {
  categories: Category[];
  products: Product[];
}

interface SortableItemProps {
  section: ProductSection;
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border ${!section.active ? "opacity-70" : ""}`}
    >
      <CardContent className="p-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="cursor-move p-1" {...attributes} {...listeners}>
              <GripVertical size={20} className="text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`active-${section.id}`}
                checked={section.active}
                onCheckedChange={() => toggleSectionActive(index)}
              />
              <Label htmlFor={`active-${section.id}`}>Ativo</Label>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeSection(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
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
                  value as "category" | "custom" | "discounted" | "new_arrivals"
                )
              }
            >
              <SelectTrigger id={`type-${section.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="custom">Produtos Personalizados</SelectItem>
                <SelectItem value="discounted">
                  Produtos com Desconto
                </SelectItem>
                <SelectItem value="new_arrivals">Produtos Novos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`start-date-${section.id}`}>Data de Início</Label>
            <Input
              id={`start-date-${section.id}`}
              type="date"
              value={formattedStartDate}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                updateSectionDate(index, "startDate", date);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`end-date-${section.id}`}>Data de Término</Label>
            <Input
              id={`end-date-${section.id}`}
              type="date"
              value={formattedEndDate}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                updateSectionDate(index, "endDate", date);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tags-${section.id}`}>
              Tags (separadas por vírgula)
            </Label>
            <Input
              id={`tags-${section.id}`}
              value={Array.isArray(section.tags) ? section.tags.join(", ") : ""}
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
        </div>

        {section.type === "category" ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor={`category-${section.id}`}>
              Selecionar Categoria
            </Label>
            <Select
              value={section.categoryId || ""}
              onValueChange={(value) => updateSectionCategory(index, value)}
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
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              Produtos com desconto são adicionados automaticamente.
            </p>
          </div>
        ) : section.type === "new_arrivals" ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              Produtos novos (últimos 30 dias) são adicionados automaticamente.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <Label>Selecionar Produtos</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products.map((product: Product) => (
                  <div key={product.id} className="flex items-center space-x-2">
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
                      className="text-sm"
                    >
                      {product.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProductDisplaySettings = ({
  categories,
  products,
}: ProductDisplaySettingsProps) => {
  const { saveDisplaySettings, getDisplaySettings } = useApi();
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(false);
  const counterRef = useRef(0);

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

  const addNewSection = () => {
    const newSection: ProductSection = {
      id: `section-${Date.now()}-${counterRef.current++}`,
      title: "Nova Seção",
      type: "category",
      active: true,
      order: sections.length,
      productIds: [],
      tags: [],
    };
    setSections([...sections, newSection]);
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
      updatedSections[index].productIds = [];
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

    // Garantir que productIds seja sempre um array
    if (!Array.isArray(section.productIds)) {
      section.productIds = [];
    }

    if (section.productIds.includes(productId)) {
      section.productIds = section.productIds.filter((id) => id !== productId);
    } else {
      section.productIds.push(productId);
    }

    setSections(updatedSections);
  };

  const toggleSectionActive = (index: number) => {
    const updatedSections = [...sections];
    updatedSections[index].active = !updatedSections[index].active;
    setSections(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
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

  const saveSettings = async () => {
    if (loading) return;

    const formattedSections = sections.map((section, index) => ({
      id: section.id,
      title: section.title,
      type: section.type,
      active: section.active,
      categoryId: section.categoryId || null,
      order: index,
      startDate: section.startDate ? new Date(section.startDate) : null,
      endDate: section.endDate ? new Date(section.endDate) : null,
      productIds: Array.isArray(section.productIds)
        ? JSON.stringify(section.productIds)
        : null,
      tags: Array.isArray(section.tags) ? JSON.stringify(section.tags) : null,
    }));

    setLoading(true);
    try {
      await saveDisplaySettings(formattedSections);
      toast.success("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
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
                <SortableItem
                  key={section.id}
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

      <CardFooter className="flex justify-end pt-4 border-t">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardFooter>
    </div>
  );
};

export default ProductDisplaySettings;
