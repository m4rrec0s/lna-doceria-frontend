"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

const banners = [
  {
    id: "brigadeiros",
    title: "Brigadeiros",
    description:
      "Experimente nossos brigadeiros artesanais em diversos sabores",
    image: "https://drive.google.com/uc?id=1fZrDviWlIIAYvJZPwlBMA3lIESS7CHbS",
    color: "from-pink-500/80 to-pink-600/80",
    link: "d16e12e7-40bb-497c-9677-409574b7c819",
  },
  {
    id: "trufas",
    title: "Trufas Especiais",
    description: "Deliciosas trufas com recheios surpreendentes",
    image:
      "https://i.pinimg.com/736x/fc/a3/c6/fca3c64968a6ebc312bbb3942c11f661.jpg",
    color: "from-purple-500/80 to-purple-600/80",
    link: "8e0deb96-5ea9-41f5-8fa6-ff80e24c46cb",
  },
  {
    id: "Barras_recheadas",
    title: "Barras Recheadas",
    description: "Barras recheadas com chocolate e muito mais",
    image: "https://drive.google.com/uc?id=1CC6d9La2bydPAfwzZnBYkWPgQ50gO8ZM",
    color: "from-amber-500/80 to-amber-600/80",
    link: "4e912c13-d2d9-451e-a313-e976c1beb4bc",
  },
  {
    id: "especiais",
    title: "Doces Finos",
    description: "Criações exclusivas para momentos únicos",
    image: "https://drive.google.com/uc?id=1IuegmHSsA0x_Oyk5Vi3iJhfxuSyMbvbR",
    color: "from-teal-500/80 to-teal-600/80",
    link: "a15d2d5d-5fc1-4a02-8bc2-c98dab3ad2ee",
  },
];

export function BannerPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovering]);

  const nextBanner = () => {
    setActiveIndex((current) => (current + 1) % banners.length);
  };

  const prevBanner = () => {
    setActiveIndex(
      (current) => (current - 1 + banners.length) % banners.length
    );
  };

  return (
    <section
      className="relative overflow-hidden bg-white py-4 md:py-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4">
        {/* Main banner carousel */}
        <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  banner.color
                )}
              />
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl max-w-md mb-6">
                  {banner.description}
                </p>
                <div>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-gray-800 hover:bg-gray-100"
                  >
                    <Link href={`/category/${banner.link}`}>
                      Explorar Agora
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation arrows */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full h-10 w-10"
            onClick={prevBanner}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Anterior</span>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full h-10 w-10"
            onClick={nextBanner}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Próximo</span>
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex ? "bg-white w-4" : "bg-white/60"
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Category thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              href={`/category/${banner.link}`}
              className={cn(
                "relative h-24 md:h-32 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-105",
                index === activeIndex && "ring-2 ring-pink-500"
              )}
              onClick={(e) => {
                e.preventDefault();
                setActiveIndex(index);
              }}
            >
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  banner.color
                )}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white font-bold text-lg md:text-xl text-center">
                  {banner.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
