"use client";

import ImageSelectPopup from "@/components/uploader/ImageSelectPopup";
import { Button } from "@/components/ui/button";
import { cn, formatImageSrc } from "@/lib/utils";
import { useGetSingleImageQuery } from "@/redux/features/addProduct/media/mediaApi";
import { setThumbnail } from "@/redux/features/imageSelector/imageSelectorSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type THomepageSectionImageProps = {
  image?: { src: string; alt?: string };
  onClear?: () => void;
};

const HomepageSectionImage = ({
  image,
  onClear,
}: THomepageSectionImageProps) => {
  const [open, setOpen] = useState(false);
  const [click, setClick] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleOpen = (value?: boolean) => {
    if (typeof value === "boolean") {
      setOpen(value);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const { thumbnail } = useAppSelector(({ imageSelector }) => imageSelector);

  const { data: thumbnailImage } = useGetSingleImageQuery(
    thumbnail || undefined,
    { skip: !thumbnail }
  );

  const selectedImage =
    thumbnailImage?.data && thumbnail
      ? { src: thumbnailImage.data.src, alt: thumbnailImage.data.alt }
      : image?.src
        ? { src: image.src, alt: image.alt }
        : null;

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setThumbnail(""));
    onClear?.();
  };

  return (
    <div className="w-full space-y-1.5">
      <div
        onClick={() => {
          handleOpen(true);
          setClick("thumbnail");
        }}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-36 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 group overflow-hidden bg-background",
          thumbnail || selectedImage
            ? "border-primary/50 hover:border-primary"
            : "border-muted-foreground/25 hover:border-primary/30 hover:bg-muted/10"
        )}
      >
        {selectedImage ? (
          <>
            <Image
              src={formatImageSrc(selectedImage.src)}
              alt={selectedImage.alt || "Section banner"}
              fill={true}
              className="object-contain transition-transform duration-500 group-hover:scale-102 p-2"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex flex-col items-center text-white">
                <ImagePlus className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Change Image</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
            <div className="p-2.5 rounded-full bg-accent group-hover:bg-primary/10 transition-colors">
              <UploadCloud className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Upload or Select Section Image
              </p>
              <p className="text-[11px] text-muted-foreground">
                If provided, will be shown on frontend instead of title &amp; subtitle
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearImage}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Remove Image
          </Button>
        </div>
      )}

      <ImageSelectPopup
        open={open}
        click={click}
        handleOpen={handleOpen}
        modalTitle="Select Homepage Section Image"
      />
    </div>
  );
};

export default HomepageSectionImage;
