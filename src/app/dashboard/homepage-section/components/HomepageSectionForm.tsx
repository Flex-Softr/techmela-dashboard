"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useGetCollectionsQuery } from "@/redux/features/collection/collectionApi";
import {
  useCreateHomepageSectionMutation,
  useUpdateHomepageSectionMutation,
} from "@/redux/features/homepageSection/homepageSectionApi";
import { setThumbnail } from "@/redux/features/imageSelector/imageSelectorSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ICollection } from "@/types/collection";
import { THomePageSection } from "@/types/homepageSection";
import { revalidateTag } from "@/utilities/revalidate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import HomepageSectionImage from "./HomepageSectionImage";

const formSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().optional().nullable(),
  collectionId: z.string().min(1, {
    message: "Collection is required.",
  }),
  sortOrder: z
    .union([z.number(), z.string(), z.undefined()])
    .refine((val) => val !== "" && val !== undefined, {
      message: "Sort order is required.",
    })
    .pipe(
      z.coerce.number().min(1, {
        message: "Sort order must be at least 1.",
      })
    ),
  limit: z.coerce
    .number()
    .min(1, {
      message: "Limit must be at least 1.",
    })
    .default(4),
  isActive: z.boolean().default(true),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

type HomepageSectionFormProps = {
  initialData?: THomePageSection;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const HomepageSectionForm = ({
  initialData,
  open: controlledOpen,
  setOpen: setControlledOpen,
  trigger,
}: HomepageSectionFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  const [isImageCleared, setIsImageCleared] = useState(false);

  const { thumbnail } = useAppSelector(({ imageSelector }) => imageSelector);
  const dispatch = useAppDispatch();

  const { data: collectionsResponse } = useGetCollectionsQuery({ limit: 100 });
  const collections = (collectionsResponse?.data?.data as ICollection[]) || [];

  const [createHomepageSection, { isLoading: isCreating }] =
    useCreateHomepageSectionMutation();
  const [updateHomepageSection, { isLoading: isUpdating }] =
    useUpdateHomepageSectionMutation();

  // Helper: Get image ID string
  const getImageId = (img: unknown): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (typeof img === "object" && "_id" in (img as { _id: string })) {
      return (img as { _id: string })._id;
    }
    return "";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      image: getImageId(initialData?.image),
      collectionId:
        typeof initialData?.collectionId === "string"
          ? initialData.collectionId
          : initialData?.collectionId?._id || "",
      sortOrder: (initialData?.sortOrder ?? "") as unknown as number,
      limit: initialData?.limit || 4,
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
      ctaText: initialData?.ctaText || "",
      ctaLink: initialData?.ctaLink || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setIsImageCleared(false);
      if (initialData) {
        const imgId = getImageId(initialData.image);
        form.reset({
          title: initialData.title || "",
          subtitle: initialData.subtitle || "",
          image: imgId,
          collectionId:
            typeof initialData.collectionId === "string"
              ? initialData.collectionId
              : initialData.collectionId._id,
          sortOrder: (initialData.sortOrder ?? "") as unknown as number,
          limit: initialData.limit || 4,
          isActive:
            initialData.isActive !== undefined ? initialData.isActive : true,
          ctaText: initialData.ctaText || "",
          ctaLink: initialData.ctaLink || "",
        });
        if (imgId) {
          dispatch(setThumbnail(imgId));
        } else {
          dispatch(setThumbnail(""));
        }
      } else {
        form.reset({
          title: "",
          subtitle: "",
          image: "",
          collectionId: "",
          sortOrder: undefined as unknown as number,
          limit: 4,
          isActive: true,
          ctaText: "",
          ctaLink: "",
        });
        dispatch(setThumbnail(""));
      }
    }
  }, [isOpen, initialData, form, dispatch]);

  // Sync thumbnail from Redux
  useEffect(() => {
    if (thumbnail) {
      form.setValue("image", thumbnail);
      setIsImageCleared(false);
    }
  }, [thumbnail, form]);

  const displayedImage =
    !isImageCleared &&
    initialData?.image &&
    typeof initialData.image === "object" &&
    "src" in initialData.image
      ? {
          src: initialData.image.src,
          alt: initialData.image.alt || "",
        }
      : undefined;

  const handleClearImage = () => {
    setIsImageCleared(true);
    form.setValue("image", "");
    dispatch(setThumbnail(""));
  };

  const handleModalClose = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      dispatch(setThumbnail(""));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const selectedImageId = isImageCleared
        ? null
        : thumbnail || values.image || (initialData?.image ? getImageId(initialData.image) : null);

      const payload = {
        ...values,
        image: selectedImageId || null,
      };

      let res;
      if (initialData) {
        res = await updateHomepageSection({
          id: initialData._id,
          data: payload,
        }).unwrap();
        await revalidateTag([
          `homepageSections-${initialData._id}`,
          "homepageSections",
        ]);
      } else {
        res = await createHomepageSection(payload).unwrap();
        await revalidateTag(["homepageSections"]);
      }

      if (res?.success) {
        toast({
          className: "bg-success text-white",
          title:
            res.message ||
            (initialData ? "Updated successfully" : "Created successfully"),
        });
        setOpen(false);
        form.reset();
        dispatch(setThumbnail(""));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Homepage Section" : "Add Homepage Section"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update homepage section details."
              : "Create a new homepage section."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Section Image (Optional) */}
            <div>
              <FormLabel className="!text-foreground text-sm font-medium block mb-2">
                Section Image (Optional)
              </FormLabel>
              <HomepageSectionImage
                image={displayedImage}
                onClear={handleClearImage}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      Title (Optional)
                    </FormLabel>
                    <Input placeholder="Enter title" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      Subtitle (Optional)
                    </FormLabel>
                    <Input placeholder="Enter subtitle" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-foreground">Collection</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection._id} value={collection._id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      Sort Order
                    </FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      Product Quantity
                    </FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="invisible">Active Status</FormLabel>
                    <div className="flex flex-row items-center justify-between rounded-lg border px-3 h-10 space-y-0">
                      <FormLabel className="text-sm font-medium cursor-pointer !text-foreground">
                        Active Status
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      CTA Text (Optional)
                    </FormLabel>
                    <Input placeholder="e.g., Shop Now" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-foreground">
                      CTA Link (Optional)
                    </FormLabel>
                    <Input placeholder="e.g., /shop/new-arrivals" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-5 pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleModalClose(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {initialData ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HomepageSectionForm;
