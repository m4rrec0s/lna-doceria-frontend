"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

const banners = [
  {
    id: "brigadeiros",
    title: "Brigadeiros",
    description:
      "Experimente nossos brigadeiros artesanais em diversos sabores",
    image: "https://drive.google.com/uc?id=1fZrDviWlIIAYvJZPwlBMA3lIESS7CHbS",
    color: "from-rose-700/70 via-rose-500/60 to-rose-300/70",
    link: "d16e12e7-40bb-497c-9677-409574b7c819",
  },
  {
    id: "trufas",
    title: "Trufas Especiais",
    description: "Deliciosas trufas com recheios surpreendentes",
    image:
      "https://i.pinimg.com/736x/fc/a3/c6/fca3c64968a6ebc312bbb3942c11f661.jpg",
    color: "from-rose-800/70 via-rose-600/60 to-rose-400/70",
    link: "8e0deb96-5ea9-41f5-8fa6-ff80e24c46cb",
  },
  {
    id: "Barras_recheadas",
    title: "Barras Recheadas",
    description: "Barras recheadas com chocolate e muito mais",
    image: "https://drive.google.com/uc?id=1CC6d9La2bydPAfwzZnBYkWPgQ50gO8ZM",
    color: "from-zinc-900/70 via-rose-800/60 to-rose-500/70",
    link: "4e912c13-d2d9-451e-a313-e976c1beb4bc",
  },
  {
    id: "especiais",
    title: "Doces Finos",
    description: "Criações exclusivas para momentos únicos",
    image: "https://drive.google.com/uc?id=1IuegmHSsA0x_Oyk5Vi3iJhfxuSyMbvbR",
    color: "from-rose-900/70 via-rose-700/60 to-rose-300/70",
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

  return (
    <section
      className="relative overflow-hidden py-4 md:py-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4">
        <div className="relative h-[320px] overflow-hidden rounded-3xl border border-zinc-200 shadow-xl md:h-[420px]">
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
                className={cn("absolute inset-0 bg-gradient-to-r", banner.color)}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white md:p-12">
                <h2 className="mb-2 text-3xl font-bold md:mb-4 md:text-4xl lg:text-5xl">
                  {banner.title}
                </h2>
                <p className="mb-6 max-w-md text-lg text-zinc-100 md:text-xl">
                  {banner.description}
                </p>
                <div>
                  <Button
                    asChild
                    size="lg"
                    className="bg-rose-300 text-rose-950 hover:bg-rose-400"
                  >
                    <Link href={`/category/${banner.link}`}>
                      Explorar Agora
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}

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

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              href={`/category/${banner.link}`}
              className={cn(
                "group relative h-24 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:h-32",
                index === activeIndex && "ring-2 ring-zinc-900"
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
              <div className={cn("absolute inset-0 bg-gradient-to-r", banner.color)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-center text-base font-bold text-white md:text-lg">
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
