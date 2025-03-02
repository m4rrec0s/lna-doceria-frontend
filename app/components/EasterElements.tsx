"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface EasterElement {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  type: "egg" | "bunny";
  rotation: string;
  image: string;
}

const eggImages = [
  "/easter/egg1.png",
  "/easter/egg2.png",
  "/easter/egg3.png",
  "/easter/egg4.png",
];

const bunnyImages = ["/easter/bunny1.png", "/easter/bunny2.png"];

export default function EasterElements() {
  const [elements, setElements] = useState<EasterElement[]>([]);

  useEffect(() => {
    // Gerar ovos caindo
    const eggs = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 5}s`,
      size: `${Math.random() * 30 + 20}px`,
      type: "egg" as const,
      rotation: `${Math.random() * 360}deg`,
      image: eggImages[Math.floor(Math.random() * eggImages.length)],
    }));

    // Gerar coelhinhos no rodapé
    const bunnies = Array.from({ length: 4 }, (_, i) => ({
      id: eggs.length + i,
      left: `${i * 25 + Math.random() * 10}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${Math.random() * 3 + 2}s`,
      size: `${Math.random() * 40 + 80}px`,
      type: "bunny" as const,
      rotation: `${Math.random() * 10 - 5}deg`,
      image: bunnyImages[Math.floor(Math.random() * bunnyImages.length)],
    }));

    setElements([...eggs, ...bunnies]);

    // Atualizar a posição dos ovos periodicamente
    const interval = setInterval(() => {
      setElements((prev) => [
        ...prev.filter((el) => el.type === "bunny"),
        ...Array.from({ length: 15 }, (_, i) => ({
          id: Date.now() + i,
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 3}s`,
          duration: `${Math.random() * 10 + 5}s`,
          size: `${Math.random() * 30 + 20}px`,
          type: "egg" as const,
          rotation: `${Math.random() * 360}deg`,
          image: eggImages[Math.floor(Math.random() * eggImages.length)],
        })),
      ]);
    }, 15000); // Atualiza a cada 15 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="easter-elements">
      {elements.map((element) => (
        <div
          key={element.id}
          className={element.type === "egg" ? "easter-egg" : "easter-bunny"}
          style={{
            left: element.left,
            animationDelay: element.delay,
            animationDuration: element.duration,
            width: element.size,
            height: element.size,
            transform: `rotate(${element.rotation})`,
            bottom: element.type === "bunny" ? "0" : "auto",
            top: element.type === "egg" ? "-50px" : "auto",
          }}
        >
          <Image
            src={element.image}
            alt={element.type === "egg" ? "Easter Egg" : "Easter Bunny"}
            layout="fill"
            objectFit="contain"
          />
        </div>
      ))}
    </div>
  );
}
