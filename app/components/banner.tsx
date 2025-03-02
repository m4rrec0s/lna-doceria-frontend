import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface BannerProps {
  imageUrl: string;
  title: string;
  description: string;
  categoryId: string;
  variant?: "default" | "pink" | "blue" | "green" | "purple";
  brightness?: boolean;
}

const CategoryIds = [
  {
    id: "2dc3b178-6e52-4a07-adae-39f96b226a38",
    name: "Cento de brigadeiros ",
  },
  {
    id: "37c5879f-2add-43f5-80c2-e76c87a91d3a",
    name: "Trufas ",
  },
  {
    id: "1bd14a27-1c91-4fdb-b46f-ed6fbccfc8ee",
    name: "Cento, doces finos ",
  },
  {
    id: "00126359-cc95-4e74-8ee4-8d5515ef3008",
    name: "Copinho de chocolate recheado ",
  },
  {
    id: "fe7f6e52-c374-4264-a3ea-54ba5a3279ba",
    name: "Brigadeiros tradicionais ",
  },
  {
    id: "037d557f-ea8b-4957-ba0b-fae49ed3e13e",
    name: "Brigadeiros especiais ",
  },
];

const Banner = ({
  imageUrl,
  title,
  description,
  categoryId,
  variant = "default",
  brightness = false,
}: BannerProps) => {
  const variantStyles = {
    default: {
      bg: "bg-pink-100",
      text: "text-black",
      hover: "group-hover:scale-105",
    },
    pink: {
      bg: "bg-pink-200",
      text: "text-pink-200",
      hover: "group-hover:scale-105",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-300",
      hover: "group-hover:translate-x-2",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-500",
      hover: "group-hover:rotate-2",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-200",
      hover: "group-hover:brightness-110",
    },
  };

  const style = variantStyles[variant];

  categoryId =
    CategoryIds.find((category) => category.name === categoryId)?.id ?? "";

  const linkHref = categoryId ? `/category/${categoryId}` : "#";

  return (
    <div
      className={`relative w-full h-[350px] max-w-lg mx-auto rounded-3xl overflow-hidden shadow-lg cursor-pointer group ${style.bg} flex-shrink-0`}
    >
      <Link href={linkHref} className="flex">
        <Image
          src={`${imageUrl}`}
          alt={"Banner Image"}
          priority
          layout="fill"
          className={`object-cover rounded-lg aspect-auto ${
            style.hover
          } transition-transform duration-300 absolute right-0 top-0 ${
            brightness ? "brightness-50" : ""
          }`}
        />
        <div className="absolute bottom-0 left-0 p-2 w-full">
          <div className={`flex flex-col p-4`}>
            <p
              className={`text-lg [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] ${style.text} font-medium`}
            >
              {description}
            </p>
            <div className="flex items-center space-x-3 ">
              <span
                className={`text-4xl font-bold [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] ${style.text}`}
              >
                {title}
              </span>
              <MoveRight size={30} className={style.text} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Banner;
