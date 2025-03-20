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
      className="bg-white rounded-lg p-4 shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <>
          <Button
            onClick={router.back}
            className="p-3 rounded-full bg-white absolute top-2 left-2 z-10"
          >
            <ChevronLeft size={30} className="text-black" />
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
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
        </>
      </div>
    </motion.div>
  );
};

export default ProductGallery;
