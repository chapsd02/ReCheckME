import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, imageUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl bg-slate-50 transition-colors duration-300 
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="object-contain h-full w-full rounded-xl p-2" />
          ) : (
            <div className="text-center p-4">
              <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-base text-slate-600">
                <span className="font-semibold text-blue-700">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
              </p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP (สูงสุด 10MB)</p>
            </div>
          )}
        </div>
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;