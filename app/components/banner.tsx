import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BannerProps {
  imageUrl: string;
  title: string;
  description: string;
  route: string;
}

const Banner = ({ imageUrl, title, description, route }: BannerProps) => {
  return (
    <div className="relative w-full h-[350px] max-w-md mx-auto rounded-3xl overflow-hidden shadow-lg cursor-pointer group bg-pink-100">
      <Link href={route} className="flex">
        <Image
          src={`${imageUrl}`}
          alt={"Banner Image"}
          priority
          layout="fill"
          className="object-cover rounded-lg aspect-auto group-hover:scale-105 transition-transform duration-300 absolute right-0 top-0"
        />
        <div className="absolute bottom-0 left-0 p-2 w-full">
          <div className="flex flex-col p-4">
            <p className="text-lg text-black">{description}</p>
            <div className="flex items-center space-x-3">
              <span className="text-4xl font-bold text-black">{title} </span>
              <MoveRight size={30} className="text-black" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Banner;
