
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResultCard from './components/AnalysisResult';
import Spinner from './components/Spinner';
import { analyzeMeterImage } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
    
    // Create a URL for preview
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(URL.createObjectURL(file));
  }, [imageUrl]);

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      setError('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeMeterImage(imageFile);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">เครื่องมือช่วยอ่านมิเตอร์ไฟฟ้า</h1>
          <p className="mt-2 text-md text-slate-600">อัปโหลดรูปถ่ายมิเตอร์ที่ไม่ชัด แล้วให้ AI ช่วยวิเคราะห์ข้อมูลให้คุณ</p>
        </header>

        <main className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col items-center space-y-6">
            <ImageUploader onFileSelect={handleFileSelect} imageUrl={imageUrl} />
            
            <button
              onClick={handleAnalyzeClick}
              disabled={!imageFile || isLoading}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? 'กำลังวิเคราะห์...' : 'เริ่มวิเคราะห์รูปภาพ'}
            </button>
            
            {error && (
              <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center" role="alert">
                <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}
          </div>
        </main>
        
        {analysisResult && (
            <AnalysisResultCard data={analysisResult} />
        )}

        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>ขับเคลื่อนด้วยเทคโนโลยี Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
