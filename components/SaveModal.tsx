"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";

type SaveModalProps = {
  roomId: string;
  title: string;
  creatorId: string;
  email: string;
  content: string;   // NEW
};

export const SaveModal = ({
  roomId,
  title,
  creatorId,
  email,
  content,
}: SaveModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveDocumentHandler = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/save-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,      // use real content from editor
          creatorId,
          email,
        }),
      });

      if (response.ok) {
        console.log("✅ Saved to MongoDB Atlas!");
      } else {
        console.error("❌ Save failed");
      }
    } catch (error) {
      console.log("Save error:", error);
    }

    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-w-9 rounded-xl bg-transparent p-2 transition-all">
          <Image
            src="/assets/icons/doc.svg"
            alt="save"
            width={20}
            height={20}
            className="mt-1"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <Image
            src="/assets/icons/doc.svg"
            alt="save"
            width={48}
            height={48}
            className="mb-4"
          />
          <DialogTitle>Save document</DialogTitle>
          <DialogDescription>
            Save this document to MongoDB Atlas for permanent storage?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5">
          <DialogClose asChild className="w-full bg-dark-400 text-white">
            Cancel
          </DialogClose>

          <Button
            onClick={saveDocumentHandler}
            className="gradient-blue w-full"
          >
            {loading ? "Saving..." : "Save to Atlas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
