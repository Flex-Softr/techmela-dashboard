"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useDeleteHomepageSectionMutation } from "@/redux/features/homepageSection/homepageSectionApi";
import { THomePageSection } from "@/types/homepageSection";
import { SquarePen, Trash2Icon } from "lucide-react";
import { useState } from "react";
import HomepageSectionForm from "./HomepageSectionForm";
import { revalidateTag } from "@/utilities/revalidate";

const HomepageSectionAction = ({
  homepageSection,
}: {
  homepageSection: THomePageSection;
}) => {
  const [deleteHomepageSection] = useDeleteHomepageSectionMutation();
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await deleteHomepageSection(homepageSection._id).unwrap();
      if (res?.success) {
        toast({
          className: "bg-success text-white",
          title: "Homepage section deleted successfully",
        });
        await revalidateTag([
          "homepageSections",
          `homepageSections-${homepageSection._id}`,
        ]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error?.data?.message || "Failed to delete homepage section",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {/* Edit Action */}
      <HomepageSectionForm
        open={editOpen}
        setOpen={setEditOpen}
        initialData={homepageSection}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            className="!bg-white hover:!bg-gray-100"
          >
            <SquarePen className="h-4 w-4 text-primary" />
          </Button>
        }
      />

      {/* Delete Action */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="!bg-white hover:!bg-gray-100"
          >
            <Trash2Icon className="h-4 w-4 text-red-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <h1 className="text-xl font-bold">Delete Homepage Section?</h1>
          <p className="text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {homepageSection.title || homepageSection.subtitle || "this section"}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-5 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageSectionAction;
