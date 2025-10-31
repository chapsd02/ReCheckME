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
      <label htmlFor="file-upload" className="cursor-pointer group">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl bg-gray-50 transition-all duration-300 
          ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-gray-300 group-hover:border-gray-400'}`}
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="object-contain h-full w-full rounded-xl p-2" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-xl transition-all duration-300">
                  <p className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">เปลี่ยนรูปภาพ</p>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-gray-500 transition-colors" />
              <p className="mt-4 text-base text-gray-600">
                <span className="font-semibold text-indigo-600">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP (สูงสุด 10MB)</p>
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