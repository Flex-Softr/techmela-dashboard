import config from "@/config/config";
import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { logOut, setUser } from "../features/auth/authSlice";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.api_base_url}/server-api/v1`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQueryWithRefreshToken: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    const urlStr = typeof args === "string" ? args : args.url;
    // Don't attempt token refresh on auth endpoints (login, logout, access-token)
    if (urlStr?.includes("/auth/")) {
      return result;
    }

    try {
      // request for getting access token
      const res = await fetch(
        `${config.api_base_url}/server-api/v1/auth/access-token`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.data?.accessToken) {
          const user = (api.getState() as RootState).auth.user;
          api.dispatch(setUser({ user: user, token: data.data.accessToken }));
          if (typeof document !== "undefined") {
            const maxAge = Math.floor(
              Number(config.token_data.access_token_cookie_expires || 86400000) /
                1000
            );
            const domainAttr =
              config.env === "production" && config.main_domain
                ? `; domain=.${config.main_domain}`
                : "";
            document.cookie = `_app.ec.at=${data.data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${domainAttr}`;
          }
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logOut());
          if (typeof document !== "undefined") {
            const domainAttr =
              config.env === "production" && config.main_domain
                ? `; domain=.${config.main_domain}`
                : "";
            document.cookie = `_app.ec.at=; path=/; max-age=0; SameSite=Lax${domainAttr}`;
          }
        }
      } else {
        api.dispatch(logOut());
        if (typeof document !== "undefined") {
          const domainAttr =
            config.env === "production" && config.main_domain
              ? `; domain=.${config.main_domain}`
              : "";
          document.cookie = `_app.ec.at=; path=/; max-age=0; SameSite=Lax${domainAttr}`;
        }
      }
    } catch {
      api.dispatch(logOut());
      if (typeof document !== "undefined") {
        const domainAttr =
          config.env === "production" && config.main_domain
            ? `; domain=.${config.main_domain}`
            : "";
        document.cookie = `_app.ec.at=; path=/; max-age=0; SameSite=Lax${domainAttr}`;
      }
    }
  }
  return result;
};

const tags = [
  "attributes",
  "brands",
  "categories",
  "singleCategory",
  "subcategories",
  "collections",
  "productList",
  "singleProduct",
  "publicProductList",
  "allOrders",
  "singleOrder",
  "processingOrders",
  "courierShipmentOrders",
  "monitorDeliveryOrders",
  "completedOrders",
  "customerOrderHistory",
  "shippingCharge",
  "paymentMethod",
  "images",
  "warrantyClaimRequests",
  "users",
  "customers",
  "mobileNumbers",
  "coupons",
  "imageToOrderReq",
  "customers",
  "courierConfig",
  "slider",
  "sliders",
  "homepage-sections",
  "registeredCustomers",
  "bookPreviews",
  "contactMessages",
  "blogPosts",
  "qna",
  "blogQaCategories",
  "blogQaTopics",
  "blogQaTags",
  "profile",
] as const;

const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: customBaseQueryWithRefreshToken,
  tagTypes: tags,
  endpoints: () => ({}),
});

export default baseApi;
