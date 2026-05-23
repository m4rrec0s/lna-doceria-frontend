"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
interface ProductGalleryProps {
  imageUrl?: string;
  alt?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  imageUrl,
  alt = "Produto",
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
        <Button
          onClick={router.back}
          className="absolute left-3 top-3 z-10 rounded-full border border-zinc-200 bg-white p-3 text-zinc-900 hover:bg-zinc-100"
        >
          <ChevronLeft size={22} />
        </Button>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200">
            <span className="text-zinc-500">Sem imagem</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductGallery;
