import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const DashboardHeader = () => {
  return (
    <header className="w-full flex justify-between items-center py-4 px-5 fixed top-0 left-0 bg-black/50 shadow-md z-40 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="LNA Doceria" width={40} height={40} />
        <div className="flex flex-col line-clamp-1">
          <span className="text-xl font-bold text-pink-300">LNA</span>
          <span className="text-sm font-bold">Confeitaria</span>
        </div>
      </Link>

      <Link href="/" passHref>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ChevronLeft size={16} />
          <span>Voltar para o site</span>
        </Button>
      </Link>
    </header>
  );
};

export default DashboardHeader;
