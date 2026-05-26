"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/app/hooks/useApi";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import ProductForm from "@/app/components/dashboard/ProductForm";
import Image from "next/image";

export default function ProductFormPage() {
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
  const [packageQuantityInput, setPackageQuantityInput] = useState("");
  const [packagePriceInput, setPackagePriceInput] = useState("");
  const [packageDiscountInput, setPackageDiscountInput] = useState("");
  const [gramsPriceQuantityInput, setGramsPriceQuantityInput] = useState("");
  const [gramsPriceValueInput, setGramsPriceValueInput] = useState("");
  const [gramsPriceDiscountInput, setGramsPriceDiscountInput] = useState("");
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

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    const objectUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setIsSubmitting(true);
    try {
      const hasVariablePrices =
        formData.packagePrices.length > 0 || formData.gramsPrices.length > 0;
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      if (!hasVariablePrices) {
        payload.append("price", String(Number(formData.price)));
      }
      if (!hasVariablePrices && formData.discount)
        payload.append("discount", String(Number(formData.discount)));
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

  if (!isEditing) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Novo produto</h1>
        <p className="text-sm text-zinc-600">
          Cadastro completo com imagem, preços por pacote e opções de gramas.
        </p>
        <div className="rounded-2xl border border-rose-100 bg-white p-4">
          <ProductForm
            categories={categories || []}
            onSubmitSuccess={() => router.back()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Editar produto</h1>
      {isFetchingProduct ? (
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-zinc-600">
          Carregando dados do produto...
        </div>
      ) : (
        <form
          onSubmit={handleUpdate}
          className="relative space-y-4 rounded-2xl border border-rose-100 bg-white p-4"
        >
          {(loading || isSubmitting) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70">
              <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-rose-600" />
            </div>
          )}
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageFile">Imagem principal</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onload = () =>
                  setImagePreview(String(reader.result || ""));
                reader.readAsDataURL(file);
              }}
            />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview produto"
                width={112}
                height={112}
                className="h-28 w-28 rounded-md border object-cover"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="galleryFiles">Imagens adicionais</Label>
            <Input
              id="galleryFiles"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setGalleryFiles((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
            />

            {existingGalleryUrls.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Imagens já salvas</p>
                <div className="flex flex-wrap gap-2">
                  {existingGalleryUrls.map((src, index) => (
                    <div
                      key={`existing-${src}-${index}`}
                      className="relative h-[72px] w-[72px]"
                    >
                      <Image
                        src={src}
                        alt={`Imagem adicional ${index + 1}`}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExistingGalleryUrls((prev) =>
                            prev.filter((_, idx) => idx !== index),
                          )
                        }
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {galleryPreviews.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">
                  Novas imagens para upload
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {galleryPreviews.map((src, index) => (
                    <div
                      key={`new-${src}-${index}`}
                      className="relative h-[72px] w-[72px]"
                    >
                      <Image
                        src={src}
                        alt={`Nova imagem ${index + 1}`}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryFiles((prev) =>
                            prev.filter((_, idx) => idx !== index),
                          )
                        }
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <Label>Preço por pacote</Label>
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Quantidade"
                value={packageQuantityInput}
                onChange={(e) => setPackageQuantityInput(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preço fechado"
                value={packagePriceInput}
                onChange={(e) => setPackagePriceInput(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Desconto (%)"
                value={packageDiscountInput}
                onChange={(e) => setPackageDiscountInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  const quantity = Number(packageQuantityInput);
                  const price = Number(packagePriceInput);
                  const discount = packageDiscountInput
                    ? Number(packageDiscountInput)
                    : 0;
                  if (
                    !quantity ||
                    quantity <= 0 ||
                    Number.isNaN(price) ||
                    price < 0 ||
                    Number.isNaN(discount) ||
                    discount < 0 ||
                    discount > 100
                  )
                    return;
                  setFormData((prev) => ({
                    ...prev,
                    packagePrices: [
                      ...prev.packagePrices.filter(
                        (item) => item.quantity !== quantity,
                      ),
                      {
                        quantity,
                        price: String(price),
                        discount: String(discount),
                      },
                    ].sort((a, b) => a.quantity - b.quantity),
                  }));
                  setPackageQuantityInput("");
                  setPackagePriceInput("");
                  setPackageDiscountInput("");
                }}
                className="rounded-md bg-zinc-900 px-3 py-2 text-white"
              >
                +
              </button>
            </div>
            <div className="space-y-1">
              {formData.packagePrices.map((entry) => (
                <div
                  key={entry.quantity}
                  className="flex items-center justify-between rounded border px-2 py-1 text-sm"
                >
                  <span>
                    Pacote {entry.quantity}: R$ {Number(entry.price).toFixed(2)}{" "}
                    ({Number(entry.discount || 0).toFixed(0)}% off)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        packagePrices: prev.packagePrices.filter(
                          (item) => item.quantity !== entry.quantity,
                        ),
                      }))
                    }
                    className="text-red-600"
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <Label>Preço por gramas</Label>
            <div className="mt-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Gramas"
                value={gramsPriceQuantityInput}
                onChange={(e) => setGramsPriceQuantityInput(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preço"
                value={gramsPriceValueInput}
                onChange={(e) => setGramsPriceValueInput(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Desconto (%)"
                value={gramsPriceDiscountInput}
                onChange={(e) => setGramsPriceDiscountInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  const quantity = Number(gramsPriceQuantityInput);
                  const price = Number(gramsPriceValueInput);
                  const discount = gramsPriceDiscountInput
                    ? Number(gramsPriceDiscountInput)
                    : 0;
                  if (
                    !quantity ||
                    quantity <= 0 ||
                    Number.isNaN(price) ||
                    price < 0 ||
                    Number.isNaN(discount) ||
                    discount < 0 ||
                    discount > 100
                  )
                    return;
                  setFormData((prev) => ({
                    ...prev,
                    gramsPrices: [
                      ...prev.gramsPrices.filter(
                        (entry) => entry.quantity !== quantity,
                      ),
                      {
                        quantity,
                        price: String(price),
                        discount: String(discount),
                      },
                    ],
                  }));
                  setGramsPriceQuantityInput("");
                  setGramsPriceValueInput("");
                  setGramsPriceDiscountInput("");
                }}
                className="rounded-md bg-zinc-900 px-3 py-2 text-white"
              >
                +
              </button>
            </div>
            <div className="space-y-1">
              {formData.gramsPrices.map((entry) => (
                <div
                  key={entry.quantity}
                  className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                >
                  <span>
                    {entry.quantity}g: R$ {Number(entry.price).toFixed(2)} (
                    {Number(entry.discount || 0).toFixed(0)}% off)
                  </span>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        gramsPrices: prev.gramsPrices.filter(
                          (item) => item.quantity !== entry.quantity,
                        ),
                      }))
                    }
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              className="min-h-[120px] w-full rounded-md border px-3 py-2"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required={
                  formData.packagePrices.length === 0 &&
                  formData.gramsPrices.length === 0
                }
                disabled={
                  formData.packagePrices.length > 0 ||
                  formData.gramsPrices.length > 0
                }
              />
            </div>
            <div>
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discount: e.target.value }))
                }
                disabled={
                  formData.packagePrices.length > 0 ||
                  formData.gramsPrices.length > 0
                }
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Categorias</Label>
            <div className="space-y-1 rounded-md border p-2">
              {(categories || []).map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        categoryIds: checked
                          ? [...prev.categoryIds, category.id]
                          : prev.categoryIds.filter((id) => id !== category.id),
                      }));
                    }}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <Label className="mb-1 block">Sabores disponíveis (visual)</Label>
            {availableFlavors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableFlavors.map((flavor) => (
                  <span
                    key={flavor.id}
                    className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-800"
                  >
                    {flavor.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Nenhum sabor encontrado nas categorias selecionadas.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
            <div>
              <Label htmlFor="minFlavors">Mínimo de sabores</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="maxFlavors">Máximo de sabores</Label>
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
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white"
            >
              {loading || isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
