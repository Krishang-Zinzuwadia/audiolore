import { useState, useCallback } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

interface Props {
  onUploadSuccess: (id: string) => void;
}

export default function Library({ onUploadSuccess }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }

      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post("/books", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Assuming response.data.book_id or similar.
        // User said "On success: Save book_id to local state".
        // The backend probably returns the book object or ID.
        // Let's assume response.data.id or response.data.book_id.
        // Based on typical FastAPI patterns, it might be response.data.id or just response.data if it's the ID.
        // I'll log it and assume `id` or `book_id`.
        const bookId =
          response.data.book_id || response.data.id || response.data;
        if (typeof bookId === "string") {
          onUploadSuccess(bookId);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Upload succeeded but received invalid ID format.");
        }
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error(error);
        const errorMsg =
          error.response?.data?.detail || error.message || "Unknown error";
        setError(`Upload failed: ${errorMsg}`);
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [uploadFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative p-12 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center group cursor-pointer overflow-hidden",
          isDragOver
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
            : "border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />

        <div
          className={cn(
            "p-5 rounded-full transition-all duration-500 relative z-0",
            isUploading
              ? "bg-indigo-500/20"
              : "bg-slate-800 group-hover:bg-slate-700 group-hover:scale-110"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          ) : (
            <UploadCloud
              className={cn(
                "w-10 h-10 transition-colors",
                isDragOver
                  ? "text-indigo-400"
                  : "text-slate-400 group-hover:text-slate-200"
              )}
            />
          )}
        </div>

        <div className="z-0">
          <h3 className="text-xl font-medium text-slate-200">
            {isUploading ? "Ingesting Book..." : "Drop a PDF Script"}
          </h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
            {isUploading
              ? "The Brain is reading and casting characters."
              : "Drag and drop your story here, or click to browse."}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-200 bg-red-900/20 border border-red-900/50 rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
