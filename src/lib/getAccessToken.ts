"use server";
import config from "@/config/config";
import { PERMISSIONS } from "@/const/permissions";
import { TUser } from "@/redux/features/auth/interface";
import decodeJWT from "@/utilities/decodeJWT";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cookie-based access-token refresh (legacy helper).
 * Auth is primarily handled client-side via Redux + AuthGuard.
 */
export default async function getAccessToken(request: NextRequest) {
  try {
    const refreshToken = cookies().get("_app.ec.rt")?.value || "";
    const res = await fetch(
      `${config.api_base_url}/server-api/v1/auth/access-token`,
      {
        method: "POST",
        headers: { authorization: refreshToken },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch access token");
    }
    const accessToken = await res.json();
    const token = accessToken.data?.accessToken;

    const cookieOption = {
      domain:
        config.env === "production" && config.main_domain
          ? `.${config.main_domain}`
          : undefined,
      httpOnly: config.env === "production",
      secure: config.env === "production",
      sameSite: "lax" as const,
      maxAge: Number(config.token_data.access_token_cookie_expires),
    };
    const response = NextResponse.next();
    response.cookies.set("_app.ec.at", token, cookieOption);
    return response;
  } catch {
    return Response.redirect(new URL(`${config.base_path}/login`, request.url));
  }
}

/**
 * Optional cookie-based profile fetch for remaining server components.
 * Does NOT redirect — missing auth is handled by client AuthGuard.
 */
export async function getProfile() {
  const accessToken = cookies().get("_app.ec.at")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(
      `${config.api_base_url}/server-api/v1/users/profile`,
      {
        method: "GET",
        headers: { authorization: `Bearer ${accessToken}` },
        cache: "force-cache",
        next: { tags: ["profile"] },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns JWT permissions from cookie when available.
 * Falls back to SUPER_ADMIN only when cookie is missing so remaining
 * server pages do not redirect to /error before client AuthGuard runs.
 * Route protection itself is handled by Redux AuthGuard.
 */
export const getPermission = () => {
  const accessToken = cookies().get("_app.ec.at")?.value;
  if (accessToken) {
    const user = decodeJWT(accessToken);
    return user as TUser;
  }

  return {
    permissions: [{ _id: "super_admin_id", name: PERMISSIONS.SUPER_ADMIN }],
  };
};

export const accessTokenFromCookies = () => {
  return cookies().get("_app.ec.at")?.value;
};
