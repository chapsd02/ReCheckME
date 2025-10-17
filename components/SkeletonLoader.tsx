
import React from 'react';

const SkeletonLoader: React.FC = () => {

  const ShimmeringDiv: React.FC<{className?: string}> = ({ className }) => (
    <div className={`bg-slate-300 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 bg-[length:1000px_100%] animate-shimmer ${className || ''}`}></div>
  );

  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden w-full">
        <div className="p-5 bg-slate-200">
            <ShimmeringDiv className="h-7 w-3/5 rounded-md" />
        </div>
        <div className="divide-y divide-slate-200">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-4 px-5">
                    <div className="flex items-center space-x-4">
                        <ShimmeringDiv className="w-10 h-10 rounded-lg" />
                        <ShimmeringDiv className="h-5 w-24 rounded" />
                    </div>
                    <ShimmeringDiv className="h-5 w-32 rounded" />
                </div>
            ))}
        </div>
        <div className="bg-slate-100 m-4 rounded-xl p-5 text-center space-y-3">
            <ShimmeringDiv className="h-6 w-2/5 rounded-md mx-auto" />
            <ShimmeringDiv className="h-12 w-3/5 rounded-md mx-auto" />
        </div>
    </div>
  );
};

export default SkeletonLoader;