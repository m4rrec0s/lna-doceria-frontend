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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";

export interface ProductSection {
  id: string;
  title: string;
  type: "category" | "custom" | "featured"; // Adicionando "featured" como tipo possível
  categoryId?: string;
  productIds?: string[];
  active: boolean;
}

interface ProductDisplaySettingsProps {
  categories: Category[];
  products: Product[];
}

const ProductDisplaySettings = ({
  categories,
  products,
}: ProductDisplaySettingsProps) => {
  const { saveDisplaySettings, getDisplaySettings } = useApi();
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Função para carregar as configurações salvas
    const loadSettings = async () => {
      setLoading(true);
      try {
        const savedSettings = await getDisplaySettings();
        if (savedSettings && Array.isArray(savedSettings)) {
          setSections(savedSettings);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        // Não mostrar toast aqui para evitar múltiplos erros na UI
        // Em vez disso, manter o estado inicial de seções vazias
      } finally {
        setLoading(false);
      }
    };

    // Adicione uma flag para evitar chamadas duplicadas
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
      id: `section-${Date.now()}`,
      title: "Nova Seção",
      type: "category",
      active: true,
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
    type: "category" | "custom" | "featured"
  ) => {
    const updatedSections = [...sections];
    updatedSections[index].type = type;
    // Resetar valores específicos do tipo
    if (type === "category") {
      updatedSections[index].productIds = undefined;
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

  const toggleProductSelection = (sectionIndex: number, productId: string) => {
    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];

    if (!section.productIds) {
      section.productIds = [productId];
    } else if (section.productIds.includes(productId)) {
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  const saveSettings = async () => {
    if (loading) return; // Evitar múltiplas chamadas enquanto já estiver carregando

    setLoading(true);
    try {
      await saveDisplaySettings(sections);
      toast.success("Configurações salvas");
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border ${
                          !section.active ? "opacity-70" : ""
                        }`}
                      >
                        <CardContent className="p-6 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="cursor-move p-1"
                                {...provided.dragHandleProps}
                              >
                                <GripVertical
                                  size={20}
                                  className="text-gray-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`active-${section.id}`}
                                  checked={section.active}
                                  onCheckedChange={() =>
                                    toggleSectionActive(index)
                                  }
                                />
                                <Label htmlFor={`active-${section.id}`}>
                                  Ativo
                                </Label>
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
                              <Label htmlFor={`title-${section.id}`}>
                                Título da Seção
                              </Label>
                              <Input
                                id={`title-${section.id}`}
                                value={section.title}
                                onChange={(e) =>
                                  updateSectionTitle(index, e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`type-${section.id}`}>
                                Tipo de Seção
                              </Label>
                              <Select
                                value={section.type}
                                onValueChange={(value) =>
                                  updateSectionType(
                                    index,
                                    value as "category" | "custom" | "featured"
                                  )
                                }
                              >
                                <SelectTrigger id={`type-${section.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="category">
                                    Categoria
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Produtos Personalizados
                                  </SelectItem>
                                  <SelectItem value="featured">
                                    Produtos em Destaque
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {section.type === "category" ? (
                            <div className="mt-4 space-y-2">
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
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="mt-4 space-y-2">
                              <Label>Selecionar Produtos</Label>
                              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {products.map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`product-${section.id}-${product.id}`}
                                        checked={section.productIds?.includes(
                                          product.id
                                        )}
                                        onCheckedChange={() =>
                                          toggleProductSelection(
                                            index,
                                            product.id
                                          )
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {sections.length === 0 && (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">
                      Nenhuma seção configurada. Clique em &quot;Adicionar
                      Seção&quot; para começar.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
