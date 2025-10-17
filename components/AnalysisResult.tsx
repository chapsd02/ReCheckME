
import React from 'react';
import type { AnalysisResult } from '../types';
import { MeterIcon } from './icons';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const ResultRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-semibold">{value || 'N/A'}</dd>
    </div>
);

const AnalysisResultCard: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full mt-8 animate-fade-in">
        <div className="p-5 bg-slate-800 text-white flex items-center space-x-3">
            <MeterIcon className="w-6 h-6"/>
            <h3 className="text-lg font-semibold leading-6">ผลการวิเคราะห์มิเตอร์</h3>
        </div>
        <div className="border-t border-slate-200 px-5 py-3">
            <dl className="divide-y divide-slate-200">
                <ResultRow label="ขนาดมิเตอร์" value={data.meterSize} />
                <ResultRow label="ประเภทมิเตอร์" value={data.meterType} />
                <ResultRow label="หมายเลข PEA" value={data.peaNumber} />
                <div className="flex justify-between items-center py-4 bg-sky-50 -mx-5 px-5 rounded-b-lg">
                    <dt className="text-lg font-bold text-sky-700">หน่วยที่อ่านได้</dt>
                    <dd className="mt-1 text-2xl font-bold text-sky-600 sm:mt-0 sm:col-span-2">{data.reading}</dd>
                </div>
            </dl>
        </div>
    </div>
  );
};

export default AnalysisResultCard;
