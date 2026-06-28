import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/pejay-ui/utils/cn";
import { Input } from "../text-inputs/input";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

/* Prop configuration for the FileInput component */
interface FileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /* Title label of the file input */
  label?: string;
  /* Validation error message */
  error?: string;
  /* Visual template variant */
  variant?: "field" | "dropzone" | "field-2";
  /* Sizing shape template for the dropzone variants */
  dropzoneVariant?: "rectangle" | "square" | "narrow";
  /* Maximum allowed file size limit (in MB) */
  maxFileSize?: number;
}

/*
 * ============================================================================
 * FileInput Component
 * ============================================================================
 */

export const FileInput = ({
  label,
  error,
  variant = "dropzone",
  dropzoneVariant = "rectangle",
  maxFileSize,
  className,
  onChange,
  accept,
  ...props
}: FileInputProps) => {
  /* Tracks the currently selected File object */
  const [file, setFile] = useState<File | null>(null);
  /* Manages dragging state overlay during drop events */
  const [isDragging, setIsDragging] = useState(false);
  /* Stores any local file format or size validation errors */
  const [internalError, setInternalError] = useState<string | undefined>(
    undefined,
  );
  /* References the hidden native file input element */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Processes selected files and enforces file size constraints */
  const handleFiles = (files: FileList | null) => {
    const selectedFile = files?.[0];
    setInternalError(undefined);

    if (selectedFile) {
      if (maxFileSize && selectedFile.size > maxFileSize * 1024 * 1024) {
        setInternalError(`File size exceeds ${maxFileSize}MB limit`);
        return;
      }
      setFile(selectedFile);
    }
  };

  /* Invokes file processor on native file change event */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    onChange?.(e);
  };

  /* Drag over callback enabling drop interactions */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /* Drag leave callback removing dragging state background highlights */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /* Drop handler capturing dropped file instances */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /* Paste handler capturing file streams from system clipboards */
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      handleFiles(files as unknown as FileList);
    }
  };

  /* Resets current selection and clears native input buffers */
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setInternalError(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || internalError;

  /* Simulates mouse click event on native hidden input tag */
  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const inputId = React.useId();

  /* Template option mapping for traditional Input fields and double action bars */
  if (variant === "field" || variant === "field-2") {
    return (
      <div
        className="flex flex-col w-full gap-1.5 outline-none"
        onPaste={handlePaste}
        tabIndex={0}
        onKeyDown={e => {
          if ((e.key === "Delete" || e.key === "Backspace") && file) {
            e.preventDefault();
            handleClear(e as unknown as React.MouseEvent);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerInput();
          }
        }}
      >
        <input
          {...props}
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Template variant 1: Custom read-only base input mimicking file paths */}
        {variant === "field" ? (
          <Input
            label={label}
            error={displayError}
            readOnly
            placeholder={props.placeholder || "Click to upload file..."}
            value={file ? file.name : ""}
            onClick={triggerInput}
            leftIcon={<Upload size={18} />}
            rightIcon={
              file && (
                <button
                  onClick={handleClear}
                  className="bg-black text-white hover:bg-red-500 rounded-full p-1 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )
            }
          />
        ) : (
          /* Template variant 2: split-action bar with inline selection button */
          <div className="flex flex-col gap-1.5">
            {label && (
              <label className="text-sm font-medium text-black ml-1">
                {label}
                {props.required && (
                  <span className="text-red-500  ml-1">*</span>
                )}
              </label>
            )}
            <div
              className={cn(
                "flex items-center w-full h-10 rounded-xl border-[1.5px] overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-sky-500/20  bg-black focus-within:border-sky-500",
                displayError ? "border-red-500" : "border-gray-800",
                className,
              )}
            >
              <div
                
                className="flex-1 h-full flex items-center px-3 truncate text-sm text-white"
              >
                {file ? (
                  <span className="truncate">{file.name}</span>
                ) : (
                  <span className="text-white">
                    {props.placeholder || "No file selected"}
                  </span>
                )}
              </div>

              <div className="flex items-center h-full">
                {file && (
                  <button
                    onClick={handleClear}
                    className="p-1 bg-white rounded-full hover:text-red-500 transition-colors mr-1.5 cursor-pointer"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={triggerInput}
                  className="h-full px-4 flex items-center text-xs font-medium border-l-[1.5px] border-gray-800 bg-white text-black cursor-pointer"
                >
                  {file ? "Replace" : "Select a File"}
                </button>
              </div>
            </div>
            {displayError && (
              <span className="text-xs text-red-500 ml-1 font-medium">
                {displayError}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  /* Default template dropzone layout variant supporting drag, drop, and paste actions */
  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-sm font-medium text-black ml-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={triggerInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerInput();
          } else if ((e.key === "Delete" || e.key === "Backspace") && file) {
            e.preventDefault();
            handleClear(e as unknown as React.MouseEvent);
          }
        }}
        className={cn(
          "group relative flex flex-col items-center justify-center w-full p-4 rounded-2xl border transition-all cursor-pointer outline-none focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 bg-black",
          file && "border-sky-500 bg-sky-500/10",
          isDragging && "border-sky-500 bg-sky-500/10",
          displayError && "border-red-500 bg-red-500/10",
          /* Sizing templates */
          dropzoneVariant === "rectangle" && "min-h-[120px]",
          dropzoneVariant === "square" && "aspect-square",
          dropzoneVariant === "narrow" && "min-h-[48px] p-2",
          className,
        )}
      >
        <input
          {...props}
          ref={fileInputRef}
          type="file"
          id={inputId}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Selected file info card display view */}
        {file ? (
          <div
            className={cn(
              "flex items-center w-full gap-4",
              dropzoneVariant === "square" &&
                "flex-col justify-center text-center gap-2",
              dropzoneVariant === "narrow" && "gap-2",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-xl shrink-0 text-sky-500 bg-black",
                dropzoneVariant === "narrow" ? "w-8 h-8" : "w-12 h-12",
              )}
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon size={dropzoneVariant === "narrow" ? 16 : 24} />
              ) : (
                <FileText size={dropzoneVariant === "narrow" ? 16 : 24} />
              )}
            </div>

            <div
              className={cn(
                "flex flex-col flex-1 min-w-0",
                dropzoneVariant === "square"
                  ? "w-full px-2 items-center"
                  : "items-start",
              )}
            >
              <span
                className={cn(
                  "truncate block w-full text-sm font-medium text-black",
                  dropzoneVariant === "square" ? "text-center" : "text-left",
                )}
              >
                {file.name}
              </span>

              <span className="text-xs text-black">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-full transition-all cursor-pointer bg-black text-white hover:bg-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Empty / Unselected state display view */
          <div
            className={cn(
              "flex items-center gap-2 pointer-events-none transition-all",
              dropzoneVariant === "narrow" ? "flex-row w-full" : "flex-col",
            )}
          >
            <div
              className={cn(
                "rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 text-black bg-white",
                dropzoneVariant === "narrow" ? "w-8 h-8" : "w-10 h-10",
              )}
            >
              <Upload size={dropzoneVariant === "narrow" ? 16 : 20} />
            </div>
            <div
              className={cn(
                "flex flex-col min-w-0",
                dropzoneVariant === "narrow" ? "items-start" : "items-center",
              )}
            >
              <span className="text-sm font-medium text-white">
                {isDragging ? "Drop your file here" : "Click or drag to upload"}
              </span>
              <span className="text-xs text-white">
                {accept ? `Supports: ${accept}` : "All file types supported"}
              </span>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <span className="text-xs text-red-500 ml-1 font-medium">
          {displayError}
        </span>
      )}
    </div>
  );
};
