"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type TProps = {
  name: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
};

const ActiveLink = ({
  name,
  href,
  icon,
  badge,
  className,
  activeClassName,
  onClick,
}: TProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const acClass = isActive
    ? activeClassName || "bg-white text-primary font-semibold shadow-xs"
    : "text-white/85 hover:bg-white/10 hover:text-white font-medium";

  return (
    <Link href={href} onClick={onClick}>
      <span
        className={cn(
          "group relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-200 ease-out",
          acClass,
          className
        )}
      >
        {icon && (
          <span
            className={cn(
              "shrink-0 transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-white/75 group-hover:text-white"
            )}
          >
            {icon}
          </span>
        )}
        {name ? (
          <span className="flex-1 truncate text-sm tracking-wide">{name}</span>
        ) : null}
        {badge}
      </span>
    </Link>
  );
};

export default ActiveLink;
