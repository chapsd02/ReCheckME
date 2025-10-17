import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResultCard from './components/AnalysisResult';
import Spinner from './components/Spinner';
import { analyzeMeterImage } from './services/geminiService';
import type { AnalysisResult } from './types';
import { BoltIcon, SparklesIcon, ArrowPathIcon } from './components/icons';
import SkeletonLoader from './components/SkeletonLoader';


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
  
  const handleReset = useCallback(() => {
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    }
    setImageFile(null);
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <header className="mb-8">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 bg-blue-600 text-white rounded-xl shadow-md">
                    <BoltIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">เครื่องมือวิเคราะห์มิเตอร์ไฟฟ้า</h1>
                    <p className="mt-1 text-lg text-slate-600">วิเคราะห์ข้อมูลจากภาพถ่ายมิเตอร์ด้วย AI</p>
                </div>
            </div>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col items-center space-y-6">
            <ImageUploader onFileSelect={handleFileSelect} imageUrl={imageUrl} />
            
            <div className="w-full flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!imageFile || isLoading}
                  className="flex-grow flex justify-center items-center gap-x-3 px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6" />}
                  {isLoading ? 'กำลังวิเคราะห์...' : 'เริ่มวิเคราะห์รูปภาพ'}
                </button>
                
                {imageFile && (
                    <button
                      onClick={handleReset}
                      disabled={isLoading}
                      className="flex-shrink-0 flex justify-center items-center gap-x-2 px-6 py-4 border border-slate-300 text-lg font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ArrowPathIcon className="w-6 h-6" />
                      <span>เริ่มต้นใหม่</span>
                    </button>
                )}
            </div>
            
            {error && (
              <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-6" role="alert">
                <p className="font-bold">เกิดข้อผิดพลาด</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </main>
        
        <div className="mt-8 w-full">
            {isLoading && <SkeletonLoader />}
            {analysisResult && <AnalysisResultCard data={analysisResult} />}
        </div>

        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>ขับเคลื่อนด้วยเทคโนโลยี Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;