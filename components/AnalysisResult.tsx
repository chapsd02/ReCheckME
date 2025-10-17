import React from 'react';
import type { AnalysisResult } from '../types';
import { BoltIcon, CpuChipIcon, HashtagIcon, ScaleIcon, TachometerIcon, ShieldCheckIcon, BuildingLibraryIcon } from './icons';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const ResultRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-4 px-5">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg">
                {icon}
            </div>
            <span className="text-base text-slate-700 font-medium">{label}</span>
        </div>
        <span className="text-base text-slate-900 font-semibold text-right">{value || 'N/A'}</span>
    </div>
);

const AnalysisResultCard: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden w-full animate-fade-in">
        <div className="p-5 bg-slate-800 text-white flex items-center space-x-4">
            <BoltIcon className="w-7 h-7"/>
            <h3 className="text-xl font-semibold tracking-wide">ผลการวิเคราะห์</h3>
        </div>

        <div className="bg-blue-50 m-4 rounded-xl p-5 text-center border border-blue-200">
            <dt className="text-base font-semibold text-blue-900 flex items-center justify-center space-x-2">
                <TachometerIcon className="w-6 h-6"/>
                <span>หน่วยที่อ่านได้ (kWh)</span>
            </dt>
            <dd className="mt-2 text-5xl font-extrabold text-blue-700 tracking-tight">{data.reading}</dd>
        </div>
        
        <div className="divide-y divide-slate-200 px-2">
            <dl>
                <ResultRow label="หน่วยงาน" value={data.authority} icon={<BuildingLibraryIcon className="w-5 h-5"/>} />
                <ResultRow label="หมายเลขเครื่องวัด" value={data.meterNumber} icon={<HashtagIcon className="w-5 h-5"/>} />
                <ResultRow label="ขนาดมิเตอร์" value={data.meterSize} icon={<ScaleIcon className="w-5 h-5"/>} />
                <ResultRow label="ประเภทมิเตอร์" value={data.meterType} icon={<CpuChipIcon className="w-5 h-5"/>} />
                <ResultRow label="สภาพภายนอก" value={data.meterCondition} icon={<ShieldCheckIcon className="w-5 h-5"/>} />
            </dl>
        </div>
    </div>
  );
};

export default AnalysisResultCard;