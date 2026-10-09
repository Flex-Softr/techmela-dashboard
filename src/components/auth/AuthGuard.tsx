"use client";

import { ROLES, TRole } from "@/const/role";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import {
  logOut,
  setProfile,
  setProfileLoading,
} from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_ROLES: TRole[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError, error, isFetching, isUninitialized } =
    useGetProfileQuery(undefined, {
      skip: !token,
    });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    if (user?.role && !ALLOWED_ROLES.includes(user.role)) {
      router.replace("/error");
    }
  }, [token, user, router]);

  useEffect(() => {
    dispatch(setProfileLoading(isLoading || isFetching));

    if (data?.data) {
      dispatch(setProfile(data.data));
    }

    if (isError) {
      const errStatus = (error as { status?: number | string })?.status;
      if (errStatus === 401) {
        dispatch(logOut());
        if (typeof document !== "undefined") {
          document.cookie = "_app.ec.at=; path=/; max-age=0; SameSite=Lax";
        }
        router.replace("/login");
      }
    }
  }, [data, isLoading, isFetching, isError, error, dispatch, router]);

  const waitingForProfile =
    !!token && (isUninitialized || isLoading || (isFetching && !data));

  if (!token || waitingForProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
