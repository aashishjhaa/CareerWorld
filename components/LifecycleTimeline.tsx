import React, { useState } from 'react';
import type { UnpackedObject, LifecycleStage } from '../types';
import { ChevronDownIcon } from './Icon';

interface LifecycleTimelineProps {
    unpackedObject: UnpackedObject;
    onCareerClick: (careerTitle: string) => void;
}

const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ unpackedObject, onCareerClick }) => {
    return (
        <div className="relative pl-8">
            {/* Vertical Line */}
            <div className="absolute top-0 left-0 h-full w-0.5 bg-white/10 -translate-x-1/2 ml-4"></div>
            
            <div className="space-y-8">
                {unpackedObject.lifecycle.map((stage, index) => (
                    <TimelineNode 
                        key={index} 
                        stage={stage} 
                        isLast={index === unpackedObject.lifecycle.length - 1}
                        onCareerClick={onCareerClick}
                    />
                ))}
            </div>
        </div>
    );
};

interface TimelineNodeProps {
    stage: LifecycleStage;
    isLast: boolean;
    onCareerClick: (careerTitle: string) => void;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ stage, isLast, onCareerClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            {/* Dot on the timeline */}
            <div className="absolute top-1.5 left-0 w-8 h-8 bg-brand-gray border-2 border-brand-lime rounded-full -translate-x-1/2 flex items-center justify-center">
                <span className="text-lg">{stage.emoji}</span>
            </div>

            <div className="ml-10">
                <div 
                    className="bg-brand-gray border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">{stage.stageName}</h3>
                            <p className="text-brand-light-gray mt-1">{stage.description}</p>
                        </div>
                        <ChevronDownIcon className={`w-6 h-6 text-brand-light-gray transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                     <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] mt-4 pt-4 border-t border-white/10' : 'max-h-0'}`}>
                        <h4 className="font-semibold text-white mb-3">Careers in this stage:</h4>
                        <div className="flex flex-wrap gap-2">
                            {stage.careers.map(career => (
                                <button
                                    key={career}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCareerClick(career);
                                    }}
                                    className="px-3 py-1.5 bg-black/20 text-brand-light-gray text-sm rounded-md hover:bg-brand-lime hover:text-brand-dark transition-colors"
                                >
                                    {career}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LifecycleTimeline;
