const config = {
  env: process.env.NEXT_PUBLIC_NODE_ENV || "development",
  api_base_url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  main_domain: process.env.NEXT_PUBLIC_MAIN_DOMAIN || "",
  client_base_url:
    process.env.NEXT_PUBLIC_CLIENT_BASE_URL || "http://localhost:3000",
  revalidate_secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || "",
  courier_status_check_url:
    process.env.NEXT_PUBLIC_COURIER_STATUS_CHECK_URL ||
    "https://steadfast.com.bd/t",
  token_data: {
    access_token_cookie_expires:
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_EXPIRES || "86400000",
  },
  company_info: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "TechMela",
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Dhaka, Bangladesh",
  },
  per_item_shipping_cost: 0,
  upload_limits: {
    image_size: Number(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_SIZE) || 2000000,
    image_max_count:
      Number(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_MAX_COUNT) || 10,
    image_formats: (process.env.NEXT_PUBLIC_UPLOAD_IMAGE_FORMAT?.split(",") || [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".JPG",
      ".JPEG",
      ".PNG",
      ".WEBP",
    ]) as string[],
    pdf_size: Number(process.env.NEXT_PUBLIC_UPLOAD_PDF_SIZE) || 5000000,
    pdf_max_count: Number(process.env.NEXT_PUBLIC_UPLOAD_PDF_MAX_COUNT) || 5,
    pdf_formats: (process.env.NEXT_PUBLIC_UPLOAD_PDF_FORMAT?.split(",") || [
      ".pdf",
      ".PDF",
    ]) as string[],
  },
  base_path: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default config;
