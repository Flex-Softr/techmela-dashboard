"use client";
import config from "@/config/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useLogOutMutation } from "@/redux/features/auth/authApi";
import { logOut } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { TErrorResponse } from "@/types/response";
import { KeyRound, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dummyUser from "../../../public/user.jpg";

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const UserMenu = () => {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.auth.profile);
  const user = useAppSelector((state) => state.auth.user);

  const fullName = profile?.fullName || "";
  const role = profile?.role || user?.role || "";
  const email = profile?.email || "";
  const profilePicUrl = profile?.profilePicture
    ? `${profile.profilePicture}`
    : dummyUser.src;

  const [logoutUser] = useLogOutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser({}).unwrap();
      dispatch(logOut());
      if (typeof document !== "undefined") {
        const domainAttr =
          config.env === "production" && config.main_domain
            ? `; domain=.${config.main_domain}`
            : "";
        document.cookie = `_app.ec.at=; path=/; max-age=0; SameSite=Lax${domainAttr}`;
      }
      router.replace("/login");
    } catch (error) {
      const err = (error as { data: TErrorResponse }).data;
      toast({
        variant: "destructive",
        title: err?.message,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 outline-none select-none"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">
              {fullName || "User"}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {String(role).replace(/_/g, " ")}
            </p>
          </div>
          <Avatar className="h-9 w-9 rounded-full border border-border">
            <AvatarImage src={profilePicUrl} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-w-[calc(100vw-1.5rem)]"
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
      >
        <DropdownMenuLabel className="space-y-0.5 text-left font-normal">
          <p className="truncate font-semibold text-foreground">
            {fullName || "User"}
          </p>
          <p className="truncate text-sm text-muted-foreground" title={email}>
            {email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/accounts" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/accounts/change-password"
            className="cursor-pointer"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
