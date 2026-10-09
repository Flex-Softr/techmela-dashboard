"use client";
import { useSidebar } from "@/providers/SidebarProvider";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/techmela-lightlogo.png";

export default function NavbarLogo() {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      href="/dashboard"
      className={isCollapsed ? "block md:hidden" : "block"}
    >
      <div className="bg-black px-3 py-1.5 rounded-lg flex items-center shadow-xs hover:opacity-95 transition-opacity">
        <Image
          className="h-7 w-auto object-contain"
          src={logo}
          alt="TechMela Logo"
          priority={true}
          width={130}
          height={32}
        />
      </div>
    </Link>
  );
}
