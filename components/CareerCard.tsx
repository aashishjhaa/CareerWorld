import React, { useState } from 'react';
import type { Career } from '../types';
import { CheckCircleIcon, ShieldIcon, TrendingUpIcon, ArrowRightIcon, ChevronDownIcon } from './Icon';

interface CareerCardProps {
  career: Career;
  onExpandRequest: () => void;
  isHydrating: boolean;
  onGoInDepth: () => void;
  style?: React.CSSProperties;
}

const CareerCard: React.FC<CareerCardProps> = ({ career, onExpandRequest, isHydrating, onGoInDepth, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHydrated = !!career.summary;

  const getRiskColor = (risk?: string) => {
    if (risk === 'Low') return 'text-green-300';
    if (risk === 'Medium') return 'text-yellow-300';
    return 'text-red-300';
  };

  const getDemandColor = (demand?: string) => {
    if (demand === 'High') return 'text-green-300';
    if (demand === 'Medium') return 'text-yellow-300';
    return 'text-red-300';
  };

  const handleExpandToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && !isHydrated) {
      onExpandRequest();
    }
  };

  const handleButtonClick = () => {
    if (!isExpanded) {
        // If not expanded, the button acts as expand
        handleExpandToggle();
    } else {
        // If expanded, the button acts as go in depth
        onGoInDepth();
    }
  };


  return (
    <div 
        className="group animate-fade-in-up h-full" 
        style={style}
    >
        <div
          onClick={handleExpandToggle}
          className="bg-brand-gray border border-white/10 rounded-2xl p-6 flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1 cursor-pointer"
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExpandToggle(); }}
        >
            <div className="flex-grow">
                <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">{career.emoji}</span>
                            <span>{career.title}</span>
                        </h3>
                        {isHydrated ? (
                           <p className="text-sm text-brand-light-gray mt-1 animate-fade-in">{career.summary}</p>
                        ) : (
                           <div className="h-4 bg-black/20 rounded mt-2 w-3/4 shimmer"></div>
                        )}
                    </div>
                    <div className="flex items-center -mr-2">
                        <ChevronDownIcon className={`w-6 h-6 text-brand-light-gray transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] mt-6' : 'max-h-0'}`}>
                    <div className="border-t border-white/10 pt-4">
                        {isHydrating && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-6 h-6 border-2 border-brand-light-gray/50 border-t-brand-lime rounded-full animate-spin"></div>
                            </div>
                        )}
                        {isHydrated && (
                            <div className="animate-fade-in">
                                <div className="flex flex-wrap gap-2 text-xs mb-6">
                                    <Tag icon={ShieldIcon} label="Automation Risk" value={career.automationRisk} colorClass={getRiskColor(career.automationRisk)} />
                                    <Tag icon={TrendingUpIcon} label="Demand Growth" value={career.demandGrowth} colorClass={getDemandColor(career.demandGrowth)} />
                                    {career.isEmerging && <Tag label="Emerging Field" colorClass="text-purple-300" />}
                                </div>
                                <h4 className="font-semibold text-white">Who This Is For:</h4>
                                <ul className="mt-2 space-y-2 text-sm text-brand-light-gray">
                                    {career.whoThisIsFor?.map((trait, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircleIcon className="w-4 h-4 text-brand-lime mt-0.5 flex-shrink-0" />
                                            <span>{trait}</span>
                                        </li>
                                    ))}
                                </ul>

                                <h4 className="mt-4 font-semibold text-white">Related Careers:</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {career.relatedCareers?.map((related, i) => (
                                        <span key={i} className="px-2 py-1 bg-black/20 text-brand-light-gray text-xs rounded-md">{related}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        
            <div className="mt-6">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick();
                  }}
                  disabled={isExpanded && !isHydrated}
                  className={`w-full py-2.5 font-semibold rounded-lg transition-colors group/button flex items-center justify-center gap-2 disabled:bg-black/20 disabled:text-brand-light-gray/50 disabled:cursor-not-allowed
                    ${isExpanded && isHydrated ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand-lime text-brand-dark hover:bg-brand-lime-dark'}`}
                >
                  <span>
                    {isExpanded ? (isHydrating ? 'Loading...' : 'Go In-Depth') : 'Expand'}
                  </span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/button:translate-x-1" />
                </button>
            </div>
        </div>
        <style>{`.shimmer { background: linear-gradient(to right, rgba(255,255,255,0.05) 4%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.05) 36%); background-size: 1000px 100%; animation: shimmer 2s linear infinite; }`}</style>
    </div>
  );
};


interface TagProps {
    label: string;
    value?: string;
    colorClass: string;
    icon?: React.FC<{className?: string}>;
}
const Tag: React.FC<TagProps> = ({ label, value, colorClass, icon: Icon }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-white/5 ${colorClass}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-white/80">{label}</span> {value && <span className="font-bold text-white">{value}</span>}
    </div>
);


export default CareerCard;