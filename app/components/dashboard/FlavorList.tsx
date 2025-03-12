import React from "react";
import { Flavor } from "../../types/flavor";
import Image from "next/image";
import { Button } from "../ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface FlavorListProps {
  flavors: Flavor[];
  loading: boolean;
  error: string | null;
  onEdit: (flavor: Flavor) => void;
  onDelete: (id: string) => void;
}

const FlavorList = ({
  flavors,
  loading,
  error,
  onEdit,
  onDelete,
}: FlavorListProps) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando sabores...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20">
        <p className="font-medium">Erro ao carregar sabores</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (flavors.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed rounded-lg">
        <p className="text-gray-500 mb-2">
          Nenhum sabor encontrado. Adicione um novo sabor para começar!
        </p>
        <p className="text-sm text-gray-400">
          Os sabores podem ser associados a categorias para organizar melhor
          seus produtos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flavors.map((flavor) => (
        <Card key={flavor.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-48 w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
              {flavor.imageUrl ? (
                <Image
                  src={flavor.imageUrl}
                  alt={flavor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-flavor.png";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Eye className="h-12 w-12 opacity-20" />
                </div>
              )}
              {flavor.category && (
                <Badge className="absolute top-2 right-2 bg-opacity-80 backdrop-blur-sm">
                  {flavor.category.name}
                </Badge>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{flavor.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {flavor.category
                  ? `Categoria: ${flavor.category.name}`
                  : "Sem categoria associada"}
              </p>
              <div className="flex space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(flavor)}
                  className="flex items-center gap-1"
                >
                  <Pencil size={16} /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(flavor.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} /> Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FlavorList;
