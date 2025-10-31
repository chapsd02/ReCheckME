import React from 'react';
import type { AnalysisResult } from '../types';
import { BoltIcon, CpuChipIcon, HashtagIcon, ScaleIcon, TachometerIcon, ShieldCheckIcon, SparklesIcon } from './icons';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const ResultRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-4 px-5 hover:bg-gray-50/80 rounded-lg transition-colors duration-200">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
                {icon}
            </div>
            <span className="text-base text-gray-700 font-medium">{label}</span>
        </div>
        <span className="text-base text-gray-900 font-semibold text-right">{value || 'N/A'}</span>
    </div>
);

const AnalysisResultCard: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200/80 shadow-xl rounded-2xl overflow-hidden w-full animate-fade-in">
        <div className="p-5 bg-gradient-to-r from-gray-800 to-gray-700 text-white flex items-center space-x-4">
            <SparklesIcon className="w-7 h-7"/>
            <h3 className="text-xl font-semibold tracking-wide">ผลการวิเคราะห์อัจฉริยะ</h3>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-100 m-4 rounded-xl p-6 text-center border border-blue-200 shadow-inner">
            <dt className="text-lg font-semibold text-indigo-900 flex items-center justify-center space-x-2">
                <TachometerIcon className="w-6 h-6"/>
                <span>หน่วยที่อ่านได้ (kWh)</span>
            </dt>
            <dd className="mt-2 text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight">{data.reading}</dd>
        </div>
        
        <div className="divide-y divide-gray-200/80 px-2 pb-2">
            <dl>
                <ResultRow label="หมายเลข PEA" value={data.peaNumber} icon={<HashtagIcon className="w-5 h-5"/>} />
                <ResultRow label="ขนาดมิเตอร์" value={data.meterSize} icon={<ScaleIcon className="w-5 h-5"/>} />
                <ResultRow label="ประเภทมิเตอร์" value={data.meterType} icon={<CpuChipIcon className="w-5 h-5"/>} />
                <ResultRow label="สภาพภายนอก" value={data.meterCondition} icon={<ShieldCheckIcon className="w-5 h-5"/>} />
            </dl>
        </div>
    </div>
  );
};

export default AnalysisResultCard;