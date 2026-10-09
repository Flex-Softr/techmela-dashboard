import Image from "next/image";
import logo from "../../public/logo.png";

const Loading = () => {
  const SITE_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;
  return (
    <div className="flex flex-col items-center justify-center gap-5 h-[100vh]">
      <div className="bg-black px-4 py-2 rounded-xl shadow-xs">
        <Image
          src={logo}
          alt="TechMela"
          width={130}
          height={36}
          priority={true}
          className="h-8 w-auto object-contain"
        />
      </div>
      <h1 className="text-4xl font-semibold">Welcome to {SITE_NAME || "TechMela"}</h1>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
