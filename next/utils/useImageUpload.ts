import { useState } from "react";

import imageCompression from "browser-image-compression";
import { useAddUpdateMyCarsToEB } from "@/hooks/garage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { GetGarageResponse } from "@/type";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { useMedia } from "@/hooks/useMedia";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { setSelectedCar, setEditCarId } = useSelectedCarStore();
  const isMobile = useMedia("(max-width: 640px)");

  const { mutate: updateMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: GetGarageResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      const updatedCar = data?.data?.[0];
      if (updatedCar?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.garage.carById(updatedCar.id) });
      }
      setSelectedCar(updatedCar ?? null);
      setEditCarId(updatedCar?.id ?? null);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      console.error("Error updating car image: ", error);
      setIsUploading(false);
    },
  });

  const compressAndUploadImage = async (file: File, carId: string) => {
    if (!file || !carId) return;

    setIsUploading(true);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);

      reader.onloadend = () => {
        const base64data = reader.result as string;

        // Send to server
        updateMyCarsToEB({
          id: carId,
          picture: base64data,
        });
      };
    } catch (error) {
      console.error("Error processing image:", error);
      setIsUploading(false);
    }
  };

  // Handler for the file input change event
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, carId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        toast("Image size cannot be more than 5MB", {
          position: isMobile ? "top-center" : "top-right",
          duration: 3000,
          style: {
            backgroundColor: "#e84855",
            color: "#fff",
          },
        });
        return;
      }

      compressAndUploadImage(file, carId);
    }
  };

  // Create a triggered upload function for custom upload buttons
  const triggerImageUpload = (carId: string) => {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    // Handle file selection
    input.onchange = () => {
      // `input.onchange` provides a DOM `Event`, not a React event.
      // Reuse the same validation/upload flow by passing a minimal compatible shape.
      handleImageChange({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>, carId);
    };

    // Trigger click to open file dialog
    input.click();
  };

  return {
    isUploading,
    handleImageChange,
    triggerImageUpload,
  };
};
