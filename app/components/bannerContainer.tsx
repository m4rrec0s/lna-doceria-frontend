"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Banner, { BannerProps } from "./banner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerContainerProps {
  banners: BannerProps[];
  autoSlideInterval?: number;
}

const BannerContainer = ({
  banners,
  autoSlideInterval = 10000,
}: BannerContainerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [bannersPerPage, setBannersPerPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const constraintsRef = useRef(null);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < 640);
      if (windowWidth >= 1280) setBannersPerPage(3);
      else if (windowWidth >= 768) setBannersPerPage(2);
      else setBannersPerPage(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageCount = Math.ceil(banners.length / bannersPerPage);

  useEffect(() => {
    if (isHovering || pageCount <= 1) return;

    const timer = setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % pageCount);
    }, autoSlideInterval);

    return () => clearTimeout(timer);
  }, [currentPage, pageCount, autoSlideInterval, isHovering]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pageCount);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pageCount) % pageCount);
  };

  const handleDragStart = (_: unknown, info: PanInfo) => {
    setDragStartX(info.point.x);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const dragEndX = info.point.x;
    const dragThreshold = 50;

    if (dragStartX - dragEndX > dragThreshold) {
      nextPage();
    } else if (dragEndX - dragStartX > dragThreshold) {
      prevPage();
    }
  };

  return (
    <div
      className="relative w-full py-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={constraintsRef}
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="flex gap-4 px-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            drag={isMobile ? "x" : false}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
          >
            {banners
              .slice(
                currentPage * bannersPerPage,
                (currentPage + 1) * bannersPerPage
              )
              .map((banner, idx) => (
                <div key={idx} className="flex-1">
                  <Banner {...banner} />
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 && (
        <>
          {/* Botões navegação - visíveis apenas em telas maiores que sm */}
          {!isMobile && (
            <>
              <button
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white transition-colors"
                onClick={prevPage}
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white transition-colors"
                onClick={nextPage}
                aria-label="Próximo"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Indicadores de página - sempre visíveis */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentPage ? "bg-pink-500 w-4" : "bg-gray-300"
                }`}
                aria-label={`Ir para página ${idx + 1}`}
              />
            ))}
          </div>

          {/* Dica de swipe - apenas visível em telas pequenas */}
          {isMobile && currentPage === 0 && (
            <div className="text-center text-sm text-gray-500 mt-2 animate-pulse">
              Arraste para ver mais
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BannerContainer;
