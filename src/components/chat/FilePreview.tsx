
import React from "react";
import { X } from "lucide-react";
import { FileAttachment } from "@/types";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: File | FileAttachment;
  onRemove?: () => void;
  className?: string;
  isAttached?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  className,
  isAttached = false,
}) => {
  const isImage = file.type.startsWith("image/");
  const isUploaded = "url" in file;
  const imageUrl = isUploaded ? (file as FileAttachment).preview : URL.createObjectURL(file as File);
  
  const fileSize = () => {
    const size = "size" in file ? file.size : (file as File).size;
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const getFileIcon = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    switch(extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📑";
      case "zip":
      case "rar":
        return "🗜️";
      case "txt":
        return "📃";
      default:
        return "📁";
    }
  };

  return (
    <div 
      className={cn(
        "group relative rounded-md border border-border bg-background p-2 transition-all animate-fade-in",
        isAttached ? "my-2" : "mr-2 mb-2",
        className
      )}
    >
      {isImage ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt={file.name}
            className={cn(
              "rounded object-cover",
              isAttached ? "max-h-40 max-w-full" : "h-20 w-20"
            )}
            onLoad={() => {
              if (!isUploaded) URL.revokeObjectURL(imageUrl);
            }}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name} ({fileSize()})
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getFileIcon()}</span>
          <div className="overflow-hidden">
            <div className="truncate text-sm">
              {file.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {fileSize()}
            </div>
          </div>
        </div>
      )}
      
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-md opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Remove file"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default FilePreview;
