"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeIn } from "../../utils/animations";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ProductGalleryProps {
  imageUrl: string;
  alt: string;
}

const ProductGallery = ({ imageUrl, alt }: ProductGalleryProps) => {
  if (!imageUrl) {
    return (
      <div className="w-full h-[300px] bg-zinc-800 rounded-lg flex items-center justify-center">
        <span className="text-4xl">🖼️</span>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute left-2 top-2 z-20 bg-white p-2 rounded-full shadow-md hover:text-pink-800 text-pink-600">
          <Link href="/" className="">
            <ChevronLeft size={24} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductGallery;
