"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/SidebarProvider";
import { useGetUnreadContactMessagesCountQuery } from "@/redux/features/contactMessage/contactMessageApi";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  CreditCard,
  FolderTree,
  Home,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  PackageSearch,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  TicketPercent,
  Truck,
  UserRound,
  Users,
  UsersRound,
  Warehouse,
  Workflow,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../../public/logo.png";
import NavLink from "../NavLink/NavLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

type TProps = {
  permissions: {
    isSuperAdmin: boolean;
    manageProduct: boolean;
    manageBlog: boolean;
    manageOrder: boolean;
    manageImgToOrder: boolean;
    manageProcessingOrder: boolean;
    manageShipmentOrder: boolean;
    manageAdminOrStaff: boolean;
    manageWarrantyClaim: boolean;
    manageCoupon: boolean;
    manageShippingCharge: boolean;
    manageCustomer: boolean;
    managePaymentMethod: boolean;
    manageCourier: boolean;
    sendSMS: boolean;
  };
};

type SidebarItem = {
  name: string;
  href?: string;
  icon?: LucideIcon;
};

type SidebarGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: SidebarItem[];
  visible: boolean;
};

const ICON_SIZE = 18;
const ICON_SIZE_SM = 16;
const ICON_STROKE = 2;

export function SidebarClient({ permissions }: TProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const {
    isSuperAdmin,
    manageProduct,
    manageBlog,
    manageOrder,
    manageProcessingOrder,
    manageShipmentOrder,
    manageAdminOrStaff,
    manageWarrantyClaim,
    manageCoupon,
    manageShippingCharge,
    manageCustomer,
    managePaymentMethod,
    manageCourier,
    sendSMS,
  } = permissions;

  const productManagementLinks = [
    { href: "/products", name: "All Products", icon: PackageSearch },
    { href: "/add-products", name: "Add Product", icon: PackagePlus },
    { href: "/category", name: "Category", icon: FolderTree },
    { href: "/attribute", name: "Attribute", icon: Tag },
    { href: "/brand", name: "Brand", icon: Layers3 },
    { href: "/collection", name: "Collection", icon: Package },
  ];

  const sidebarGroups: SidebarGroup[] = [
    {
      key: "products",
      label: "Products",
      icon: Package,
      visible: !!manageProduct,
      items: productManagementLinks.map((link) => ({
        name: link.name,
        href: `/dashboard${link.href}`,
        icon: link.icon,
      })),
    },
    {
      key: "orders",
      label: "Orders",
      icon: ShoppingCart,
      visible: true,
      items: [
        manageOrder && {
          name: "Orders",
          href: "/dashboard/orders",
          icon: ClipboardList,
        },
        manageProcessingOrder && {
          name: "Processing Orders",
          href: "/dashboard/processing-orders",
          icon: Workflow,
        },
        manageShipmentOrder && {
          name: "Courier Shipments",
          href: "/dashboard/courier-shipment",
          icon: Truck,
        },
        (manageCourier || manageProcessingOrder) && {
          name: "Monitor Delivery",
          href: "/dashboard/monitor-delivery",
          icon: MapPin,
        },
        (manageOrder ||
          manageProcessingOrder ||
          manageShipmentOrder ||
          isSuperAdmin) && {
          name: "Fraud Check",
          href: "/dashboard/fraud-check",
          icon: ShieldCheck,
        },
      ].filter(Boolean) as SidebarItem[],
    },
    {
      key: "media",
      label: "Media",
      icon: ImageIcon,
      visible: !!manageProduct,
      items: [
        {
          name: "Media",
          href: "/dashboard/media",
          icon: ImageIcon,
        },
        // {
        //   name: "Book Previews",
        //   href: "/dashboard/book-previews",
        //   icon: BookOpen,
        // },
        // { name: "Free PDFs", href: "/dashboard/free-pdfs", icon: FileText },
      ],
    },
    {
      key: "blog-qna",
      label: "Blog & QnA",
      icon: BookOpen,
      visible: !!(isSuperAdmin || manageBlog),
      items: [
        {
          name: "Blog Posts",
          href: "/dashboard/blog-posts",
          icon: BookOpen,
        },
        { name: "QnA", href: "/dashboard/qna", icon: MessageCircle },
        {
          name: "Categories",
          href: "/dashboard/blog-qna-categories",
          icon: FolderTree,
        },
        {
          name: "Topics",
          href: "/dashboard/blog-qna-topics",
          icon: Layers3,
        },
        {
          name: "Tags",
          href: "/dashboard/blog-qna-tags",
          icon: Tag,
        },
      ],
    },
    {
      key: "configuration",
      label: "Configuration",
      icon: Settings2,
      visible: true,
      items: [
        (isSuperAdmin || manageProduct) && {
          name: "Slider Config",
          href: "/dashboard/slider-section",
          icon: SlidersHorizontal,
        },
        (isSuperAdmin || manageProduct) && {
          name: "Homepage Sections",
          href: "/dashboard/homepage-section",
          icon: LayoutTemplate,
        },
        manageShippingCharge && {
          name: "Shipping Charges",
          href: "/dashboard/manage-shipping-charges",
          icon: Truck,
        },
        managePaymentMethod && {
          name: "Payment Config",
          href: "/dashboard/payment-configuration",
          icon: CreditCard,
        },
        manageCourier && {
          name: "Courier Config",
          href: "/dashboard/courier-configuration",
          icon: Warehouse,
        },
        manageAdminOrStaff && {
          name: "Manage Employees",
          href: "/dashboard/manage-admin-staff",
          icon: UsersRound,
        },
      ].filter(Boolean) as SidebarItem[],
    },
    {
      key: "marketing",
      label: "Marketing",
      icon: TicketPercent,
      visible: !!(manageCoupon || sendSMS),
      items: [
        manageCoupon && {
          name: "Manage Coupons",
          href: "/dashboard/manage-coupon",
          icon: TicketPercent,
        },
        sendSMS && {
          name: "SMS",
          href: "/dashboard/sms",
          icon: MessageCircle,
        },
      ].filter(Boolean) as SidebarItem[],
    },
    {
      key: "customers",
      label: "Customers",
      icon: Users,
      visible: !!manageCustomer,
      items: [
        {
          name: "Customer List",
          href: "/dashboard/customers",
          icon: Users,
        },
        {
          name: "Registered customers",
          href: "/dashboard/registered-customers",
          icon: UserRound,
        },
        {
          name: "Contact Messages",
          href: "/dashboard/contact-messages",
          icon: Mail,
        },
      ],
    },
  ];

  const activeGroup = sidebarGroups.find((group) =>
    group.items.some((item) => item.href === pathname)
  )?.key;

  const getCollapsedItems = () => {
    const items: SidebarItem[] = [];

    if (manageProduct) {
      items.push({
        name: "",
        href: "/dashboard/products",
        icon: Package,
      });
      items.push({
        name: "",
        href: "/dashboard/media",
        icon: ImageIcon,
      });
      items.push({
        name: "",
        href: "/dashboard/book-previews",
        icon: BookOpen,
      });
    }

    if (isSuperAdmin || manageBlog) {
      items.push({
        name: "",
        href: "/dashboard/blog-posts",
        icon: BookOpen,
      });
      items.push({
        name: "",
        href: "/dashboard/qna",
        icon: MessageCircle,
      });
      items.push({
        name: "",
        href: "/dashboard/blog-qna-topics",
        icon: Layers3,
      });
    }

    if (manageOrder)
      items.push({
        name: "",
        href: "/dashboard/orders",
        icon: ClipboardList,
      });
    if (manageProcessingOrder)
      items.push({
        name: "",
        href: "/dashboard/processing-orders",
        icon: Workflow,
      });
    if (manageShipmentOrder)
      items.push({
        name: "",
        href: "/dashboard/courier-shipment",
        icon: Truck,
      });
    if (manageCourier || manageProcessingOrder)
      items.push({
        name: "",
        href: "/dashboard/monitor-delivery",
        icon: MapPin,
      });
    if (manageWarrantyClaim)
      items.push({
        name: "",
        href: "/dashboard/warranty-claims",
        icon: ShieldAlert,
      });
    items.push({
      name: "",
      href: "/dashboard/fraud-check",
      icon: ShieldCheck,
    });

    if (manageShippingCharge)
      items.push({
        name: "",
        href: "/dashboard/manage-shipping-charges",
        icon: Truck,
      });
    if (managePaymentMethod)
      items.push({
        name: "",
        href: "/dashboard/payment-configuration",
        icon: CreditCard,
      });
    if (manageCourier)
      items.push({
        name: "",
        href: "/dashboard/courier-configuration",
        icon: Warehouse,
      });
    if (manageAdminOrStaff)
      items.push({
        name: "",
        href: "/dashboard/manage-admin-staff",
        icon: UsersRound,
      });
    if (isSuperAdmin || manageProduct) {
      items.push({
        name: "",
        href: "/dashboard/slider-section",
        icon: SlidersHorizontal,
      });
      items.push({
        name: "",
        href: "/dashboard/homepage-section",
        icon: LayoutTemplate,
      });
    }

    if (manageCoupon)
      items.push({
        name: "",
        href: "/dashboard/manage-coupon",
        icon: TicketPercent,
      });
    if (sendSMS)
      items.push({
        name: "",
        href: "/dashboard/sms",
        icon: MessageCircle,
      });

    if (manageCustomer) {
      items.push({
        name: "",
        href: "/dashboard/customers",
        icon: Users,
      });
      items.push({
        name: "",
        href: "/dashboard/registered-customers",
        icon: UserRound,
      });
      items.push({
        name: "",
        href: "/dashboard/contact-messages",
        icon: Mail,
      });
    }

    return items;
  };

  const canReadContactMessages =
    permissions.isSuperAdmin || permissions.manageAdminOrStaff;

  const { data: unreadCountData } = useGetUnreadContactMessagesCountQuery(
    undefined,
    {
      pollingInterval: 600000,
      skip: !canReadContactMessages,
    }
  );
  const unreadCount = unreadCountData?.data || 0;

  const collapsedLinkClass =
    "justify-center gap-0 mx-auto !px-2 !py-2 border-0 shadow-none";

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cn(
          "fixed z-50 flex h-screen flex-col border-r border-black/10 bg-primary text-primary-foreground transition-all duration-300 md:relative md:top-auto md:h-[calc(100vh-56px)] overflow-y-auto no-scrollbar",
          isCollapsed
            ? "-translate-x-full md:translate-x-0 md:w-[68px]"
            : "translate-x-0 w-64 box-border"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-0.5 py-3",
            isCollapsed ? "items-center px-2" : "px-2.5"
          )}
        >
          {!isCollapsed && (
            <div className="mb-2 flex items-center justify-between border-b border-white/15 px-1 py-2 md:hidden">
              <div className="bg-black px-2.5 py-1 rounded-lg flex items-center shadow-xs">
                <Image
                  src={logo}
                  alt="TechMela Logo"
                  width={100}
                  height={36}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </div>
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={18} strokeWidth={ICON_STROKE} />
              </button>
            </div>
          )}

          <div className={cn("space-y-0.5", !isCollapsed && "mb-1")}>
            {isSuperAdmin && (
              <NavLink
                href="/dashboard"
                name={isCollapsed ? "" : "Home"}
                icon={<Home size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                className={cn("m-0", isCollapsed && collapsedLinkClass)}
              />
            )}
            {isSuperAdmin && (
              <NavLink
                href="/dashboard/reports"
                name={isCollapsed ? "" : "Reports"}
                icon={<BarChart3 size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                className={cn("m-0", isCollapsed && collapsedLinkClass)}
              />
            )}
          </div>

          {!isCollapsed && <div className="mx-1 my-2 h-px bg-white/15" />}

          {isCollapsed ? (
            <div className="flex w-full flex-col items-center gap-1 py-1">
              {getCollapsedItems().map((item, idx) => (
                <NavLink
                  key={idx}
                  href={item.href || "#"}
                  name=""
                  icon={
                    <div className="relative">
                      {item.icon ? (
                        <item.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      ) : undefined}
                      {item.href === "/dashboard/contact-messages" &&
                        unreadCount > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] text-destructive-foreground ring-2 ring-primary">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                    </div>
                  }
                  className={collapsedLinkClass}
                />
              ))}
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-0.5"
              defaultValue={activeGroup}
            >
              {sidebarGroups
                .filter((group) => group.visible && group.items.length > 0)
                .map((group) => {
                  const isGroupActive = group.key === activeGroup;
                  return (
                    <AccordionItem
                      key={group.key}
                      value={group.key}
                      className="border-none"
                    >
                      <AccordionTrigger
                        className={cn(
                          "rounded-lg border-b-0 px-2.5 py-2 text-sm transition-colors duration-200 hover:no-underline group [&>svg]:h-4 [&>svg]:w-4",
                          isGroupActive
                            ? "bg-white/15 font-semibold text-white [&>svg]:text-white"
                            : "font-medium text-white/85 hover:bg-white/10 hover:text-white [&>svg]:text-white/70 group-hover:[&>svg]:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <group.icon
                              size={ICON_SIZE}
                              strokeWidth={ICON_STROKE}
                              className={cn(
                                "transition-colors",
                                isGroupActive
                                  ? "text-white"
                                  : "text-white/80 group-hover:text-white"
                              )}
                            />
                            {group.key === "customers" && unreadCount > 0 && (
                              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-primary" />
                            )}
                          </div>
                          <span className="text-sm tracking-wide">
                            {group.label}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="ml-3 border-l border-white/20 pb-1 pl-3 pt-0.5">
                        {group.items.map((item, idx) => (
                          <NavLink
                            key={idx}
                            href={item.href || "#"}
                            name={item.name}
                            icon={
                              item.icon ? (
                                <item.icon
                                  size={ICON_SIZE_SM}
                                  strokeWidth={ICON_STROKE}
                                />
                              ) : undefined
                            }
                            className="m-0 w-full justify-start !px-2 !py-1.5 text-sm"
                            badge={
                              item.href === "/dashboard/contact-messages" &&
                              unreadCount > 0 ? (
                                <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              ) : undefined
                            }
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}

          {!isCollapsed && <div className="mx-1 my-2 h-px bg-white/15" />}

          <NavLink
            href="/dashboard/accounts"
            name={isCollapsed ? "" : "Profile"}
            icon={<UserRound size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            className={cn("m-0 mt-0.5", isCollapsed && collapsedLinkClass)}
          />
        </div>
      </aside>
    </>
  );
}
