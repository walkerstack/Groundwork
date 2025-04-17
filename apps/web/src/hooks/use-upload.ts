import { useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const uploadWithProgress = (
  url: string,
  file: File,
  {
    onProgress,
  }: {
    onProgress: (percent: number) => void;
  },
) => {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        onProgress(percentCompleted);
      }
    });

    xhr.onload = () => {
      if (xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Error during upload."));
    };

    xhr.send(file);
  });
};

export function useUploadFile({ namespaceId }: { namespaceId: string }) {
  const trpc = useTRPC();
  const { mutateAsync: getPresignedUrl } = useMutation(
    trpc.upload.getPresignedUrl.mutationOptions(),
  );

  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; name: string }[]
  >([]);

  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  async function onUpload(file: File) {
    setIsUploading(true);
    let newEntry: { name: string; key: string } | null = null;

    try {
      const presignResponse = await getPresignedUrl({
        namespaceId,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await uploadWithProgress(presignResponse.url, file, {
        onProgress: (percent) => {
          setProgresses((prev) => ({ ...prev, [file.name]: percent }));
        },
      });

      newEntry = { name: file.name, key: presignResponse.key };
      setUploadedFiles((prev) => [...prev, newEntry!]);
    } catch {
      toast.error("Failed to upload file!");
    } finally {
      setProgresses({});
      setIsUploading(false);
    }

    return newEntry;
  }

  return {
    onUpload,
    uploadedFiles,
    progresses,
    isUploading,
  };
}
