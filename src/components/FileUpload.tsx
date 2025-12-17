import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image, FileVideo, File } from "lucide-react";
import { Button } from "./ui/button";

interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
  type: "image" | "video" | "other";
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

const FileUpload = ({ onFilesChange, disabled }: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: isImage ? URL.createObjectURL(file) : null,
        type: isImage ? "image" : isVideo ? "video" : "other",
      };
    });

    const updatedFiles = [...files, ...newFiles].slice(0, 5); // Max 5 files
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <FileVideo className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.html,.css"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm text-muted-foreground">
          Drop reference images, videos, or templates
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Max 5 files • Helps AI understand your vision
        </p>
      </div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <p className="text-[10px] text-muted-foreground truncate w-16 mt-1 text-center">
                  {file.file.name.slice(0, 10)}...
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
