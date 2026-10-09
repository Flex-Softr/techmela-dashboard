import { ICollection } from "./collection";

export type THomePageSectionImage = {
  _id: string;
  src: string;
  alt?: string;
};

export type THomePageSection = {
  _id: string;
  title?: string;
  subtitle?: string;
  image?: THomePageSectionImage | string | null;
  collectionId: string | ICollection; // Foreign key to Collection
  sortOrder: number | undefined;
  limit: number;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Input for Create/Update
export type THomePageInput = {
  title?: string;
  subtitle?: string;
  image?: string | null;
  collectionId: string;
  sortOrder?: number;
  limit?: number;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
};
