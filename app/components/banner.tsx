import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface BannerProps {
  imageUrl: string;
  title: string;
  description: string;
  route: string;
  variant?: "default" | "pink" | "blue" | "green" | "purple";
  brightness?: boolean;
}

const Banner = ({
  imageUrl,
  title,
  description,
  route,
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

  return (
    <div
      className={`relative w-full h-[350px] max-w-lg mx-auto rounded-3xl overflow-hidden shadow-lg cursor-pointer group ${style.bg} flex-shrink-0`}
    >
      <Link href={route} className="flex">
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
