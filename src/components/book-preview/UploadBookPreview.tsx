import { useToast } from "@/components/ui/use-toast";
import { useUploadBookPreviewMutation } from "@/redux/features/bookPreview/bookPreviewApi";
import { Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
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

const UploadBookPreview = ({
  fixedType,
}: {
  fixedType?: "short" | "full" | "free";
}) => {
  const { toast } = useToast();
  const [uploadBookPreview, { isLoading }] = useUploadBookPreviewMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<File[]>([]);
  const [previewType, setPreviewType] = useState<"short" | "full" | "free">(
    fixedType || "short"
  );

  const MAX_FILE_SIZE = config.upload_limits.pdf_size;
  const MAX_FILE_COUNT = config.upload_limits.pdf_max_count;
  const ALLOWED_FORMATS = config.upload_limits.pdf_formats;

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);

      if (previews.length + fileList.length > MAX_FILE_COUNT) {
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
            description: `${file.name} exceeds the ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB limit.`,
          });
          return false;
        }
        return true;
      });
      setPreviews([...previews, ...validFiles]);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (previews.length + files.length > MAX_FILE_COUNT) {
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
          description: `${file.name} exceeds the ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB limit.`,
        });
        return false;
      }
      return true;
    });
    setPreviews([...previews, ...validFiles]);
  };

  const removePreview = (index: number) => {
    const updatedFiles = [...previews];
    updatedFiles.splice(index, 1);
    setPreviews(updatedFiles);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      previews.forEach((preview) => {
        formData.append("files", preview);
      });
      formData.append("previewType", previewType);

      const res = await uploadBookPreview(formData).unwrap();
      if (!res.error) {
        setPreviews([]);
      }
      toast({
        className: "bg-success text-white text-2xl",
        title: "Book previews uploaded successfully!",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        variant: "destructive",
        title:
          err?.data?.message || err?.message || "Book previews upload failed!",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {previews.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div
            className="min-h-[200px] border-2 border-dashed border-gray-300 cursor-pointer p-4"
            onClick={() => document.getElementById("fileInput")?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 h-full overflow-y-auto">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-full rounded-sm border border-gray-300 flex flex-col items-center justify-center p-4 bg-gray-50 h-[150px]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(index);
                    }}
                    className="bg-white absolute right-1 top-1 p-1 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 shadow-sm"
                  >
                    <Cross2Icon className="h-5 w-5 hover:text-red-500" />
                  </button>
                  <FileTextIcon className="h-12 w-12 text-red-500 mb-2" />
                  <span
                    className="text-xs text-center break-words w-full truncate px-2"
                    title={preview.name}
                  >
                    {preview.name}
                  </span>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept={ALLOWED_FORMATS.join(", ")}
              className="hidden"
              onChange={handleFileInputChange}
              id="fileInput"
              multiple
            />
          </div>
          <div className="flex justify-between items-center gap-2">
            {!fixedType ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Preview Type:
                </span>
                <Select
                  value={previewType}
                  onValueChange={(val: "short" | "full" | "free") =>
                    setPreviewType(val)
                  }
                >
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
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
                onClick={() => setPreviews([])}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isLoading || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload PDFs"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col justify-center items-center min-h-[60vh] w-full border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => document.getElementById("fileInput")?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <FileTextIcon className="h-16 w-16 text-gray-400" />
            <p className="text-gray-500 font-medium">
              Drag and drop PDF files here
            </p>
            <input
              type="file"
              accept={ALLOWED_FORMATS.join(", ")}
              className="hidden"
              onChange={handleFileInputChange}
              id="fileInput"
              multiple
            />
            <Button size={"sm"} variant={"secondary"}>
              Select PDF Files
            </Button>
            <p className="text-sm text-gray-400 font-medium">
              Maximum allow upload at once: {MAX_FILE_COUNT} files.
            </p>
            <p className="text-sm text-gray-400">
              Maximum allow upload file size:{" "}
              {(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB. Allowed format:{" "}
              {ALLOWED_FORMATS.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBookPreview;
