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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-2xl shadow-lg mb-4">
                <BoltIcon className="w-10 h-10" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">เครื่องมือวิเคราะห์มิเตอร์ไฟฟ้า</h1>
                <p className="mt-2 text-xl text-gray-600">วิเคราะห์ข้อมูลจากภาพถ่ายมิเตอร์ด้วย AI อัจฉริยะ</p>
            </div>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200/80">
          <div className="flex flex-col items-center space-y-6">
            <ImageUploader onFileSelect={handleFileSelect} imageUrl={imageUrl} />
            
            <div className="w-full flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!imageFile || isLoading}
                  className="flex-grow flex justify-center items-center gap-x-3 px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-indigo-500/20"
                >
                  {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6" />}
                  {isLoading ? 'กำลังวิเคราะห์...' : 'เริ่มวิเคราะห์รูปภาพ'}
                </button>
                
                {imageFile && (
                    <button
                      onClick={handleReset}
                      disabled={isLoading}
                      className="flex-shrink-0 flex justify-center items-center gap-x-2 px-6 py-4 border border-gray-300 text-lg font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-500/50 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
                    >
                      <ArrowPathIcon className="w-6 h-6" />
                      <span>เริ่มต้นใหม่</span>
                    </button>
                )}
            </div>
            
            {error && (
              <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-6 animate-fade-in" role="alert">
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

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>ขับเคลื่อนด้วยเทคโนโลยี Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;