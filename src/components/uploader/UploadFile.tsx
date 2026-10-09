import { useUploadImageMutation } from "@/redux/features/imageSelector/imageApi";
import { useToast } from "@/components/ui/use-toast";
import { Cross2Icon, ImageIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Button } from "../ui/button";
import config from "@/config/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const UploadFile = ({
  purpose,
}: {
  purpose?: "product" | "blog" | "general";
}) => {
  const { toast } = useToast();
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<
    "product" | "blog" | "general"
  >(purpose || "general");

  const MAX_FILE_SIZE = config.upload_limits.image_size;
  const MAX_FILE_COUNT = config.upload_limits.image_max_count;
  const ALLOWED_FORMATS = config.upload_limits.image_formats;

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);

      if (images.length + fileList.length > MAX_FILE_COUNT) {
        toast({
          variant: "destructive",
          title: "Too many files",
          description: `You can only upload a maximum of ${MAX_FILE_COUNT} files at once.`,
        });
        return;
      }

      const validFiles = fileList.filter((file) => {
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (
          !ALLOWED_FORMATS.map((f: string) => f.toLowerCase()).includes(
            fileExtension
          )
        ) {
          toast({
            variant: "destructive",
            title: "Invalid file format",
            description: `${file.name} is not a supported format.`,
          });
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `${file.name} exceeds the ${Math.round(
              MAX_FILE_SIZE / (1024 * 1024)
            )} MB limit.`,
          });
          return false;
        }
        return true;
      });
      setImages([...images, ...validFiles]);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (images.length + files.length > MAX_FILE_COUNT) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can only upload a maximum of ${MAX_FILE_COUNT} files at once.`,
      });
      return;
    }

    const validFiles = files.filter((file) => {
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (
        !ALLOWED_FORMATS.map((f: string) => f.toLowerCase()).includes(
          fileExtension
        )
      ) {
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: `${file.name} is not a supported format.`,
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the ${Math.round(
            MAX_FILE_SIZE / (1024 * 1024)
          )} MB limit.`,
        });
        return false;
      }
      return true;
    });
    setImages([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const updatedFiles = [...images];
    updatedFiles.splice(index, 1);
    setImages(updatedFiles);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("purpose", selectedPurpose);

      const res = await uploadImage(formData).unwrap();
      if (!res.error) {
        setImages([]);
      }
      toast({
        className: "bg-success text-white text-2xl",
        title: "Images uploaded successfully!",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err?.data?.message || err?.message || "Images upload failed!",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {images.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div
            className="min-h-[200px] border-2 border-dashed border-gray-300 cursor-pointer p-2"
            onClick={() => document.getElementById("fileInput")?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2 h-full overflow-y-auto">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square relative w-full rounded-sm border border-gray-300"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      removeImage(index);
                    }}
                    className="bg-white absolute right-1 top-1 p-1 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                  >
                    <Cross2Icon className="h-5 w-5" />
                  </button>
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Image ${index}`}
                    fill={true}
                    className="object-contain rounded-sm"
                    sizes="(max-width: 208px) 100vw,"
                  />
                </div>
              ))}
            </div>
            <input
              type="file"
              accept={ALLOWED_FORMATS.join(",")}
              className="hidden"
              onChange={handleFileInputChange}
              id="fileInput"
              multiple
            />
          </div>
          <div className="flex justify-between items-center gap-2">
            {!purpose ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Image Type:
                </span>
                <Select
                  value={selectedPurpose}
                  onValueChange={(val: "product" | "blog" | "general") =>
                    setSelectedPurpose(val)
                  }
                >
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImages([])}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isLoading || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col justify-center items-center min-h-[60vh] w-full border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
          onClick={() => document.getElementById("fileInput")?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400" />
            <p className="text-xl font-semibold text-gray-600">
              Drag and drop images here
            </p>
            <input
              type="file"
              accept={ALLOWED_FORMATS.join(",")}
              className="hidden"
              onChange={handleFileInputChange}
              id="fileInput"
              multiple
            />
            <Button size={"sm"} variant={"secondary"}>
              Select Images
            </Button>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs font-medium text-gray-400">
                Maximum allow upload at once: {MAX_FILE_COUNT} files.
              </p>
              <p className="text-xs text-gray-400">
                Maximum allow upload file size:{" "}
                {Math.round(MAX_FILE_SIZE / (1024 * 1024))} MB.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
