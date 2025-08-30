import React, { useState } from 'react';
import type { Persona, Problem, PersonaProblemSet } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { BackArrowIcon, ChevronDownIcon, BriefcaseIcon } from './Icon';

interface ProblemExplorerProps {
    persona: Persona;
    problemsData: PersonaProblemSet | null;
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    onCareerClick: (careerTitle: string) => void;
}

const ProblemExplorer: React.FC<ProblemExplorerProps> = ({ persona, problemsData, isLoading, error, onBack, onCareerClick }) => {
    const { icon: Icon } = persona;

    return (
        <main className="container mx-auto px-4 pt-28 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand-gray rounded-full flex items-center justify-center border-2 border-brand-lime flex-shrink-0">
                        <Icon className="w-10 h-10 text-brand-lime" />
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white">{persona.title}</h1>
                        <p className="mt-2 max-w-2xl text-lg text-brand-light-gray">{persona.tagline}</p>
                    </div>
                </div>
                <button onClick={onBack} className="group flex items-center gap-2 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-5 py-2.5 rounded-full transition-all mt-2 sm:mt-0 flex-shrink-0">
                    <BackArrowIcon className="w-5 h-5 transition-transform" />
                    <span>Back to Personas</span>
                </button>
            </div>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <LoadingSpinner />
                    <p className="mt-6 text-white text-lg font-semibold">Generating problems...</p>
                    <p className="text-brand-light-gray">Our AI is figuring out the challenges for {persona.title}.</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="text-center py-20 bg-red-900/20 border border-red-500/30 rounded-2xl mt-8">
                    <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
                    <p className="mt-2 max-w-md mx-auto text-red-300/80">{error}</p>
                     <button onClick={onBack} className="group mt-8 flex items-center mx-auto gap-2 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-5 py-2.5 rounded-full transition-all">
                        <BackArrowIcon className="w-5 h-5 transition-transform" />
                        <span>Try Again</span>
                    </button>
                </div>
            )}
            
            {!isLoading && problemsData && (
              <>
                {/* Accordion for Mobile */}
                <div className="space-y-4 max-w-4xl mx-auto md:hidden">
                    {problemsData.problems.map((problem, index) => (
                        <ProblemAccordion 
                            key={index} 
                            problem={problem} 
                            onCareerClick={onCareerClick}
                        />
                    ))}
                </div>
                {/* Mind Map for Desktop */}
                <div className="hidden md:block">
                    <ProblemMindMap persona={persona} problemsData={problemsData} onCareerClick={onCareerClick} />
                </div>
              </>
            )}
        </main>
    );
};

// FIX: Defined a specific props interface for ProblemMindMap to resolve missing properties error.
interface ProblemMindMapProps {
    persona: Persona;
    problemsData: PersonaProblemSet | null;
    onCareerClick: (careerTitle: string) => void;
}

const ProblemMindMap: React.FC<ProblemMindMapProps> = ({ persona, problemsData, onCareerClick }) => {
    const Icon = persona.icon;
    const problems = problemsData?.problems || [];
    const numProblems = problems.length;
    
    return (
      <div className="flex flex-col items-center py-8">
          {/* Persona Node */}
          <div className="animate-fade-in-up z-10">
              <div className="bg-brand-gray border-2 border-brand-lime rounded-2xl p-4 flex flex-col items-center text-center shadow-lg w-64">
                  <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center border border-white/10">
                    <Icon className="w-8 h-8 text-brand-lime" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{persona.title}</h3>
              </div>
          </div>
  
          {/* Connecting Lines */}
          {numProblems > 0 && (
              <div className="relative w-full h-24" aria-hidden="true">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/20 animate-fade-in" style={{ animationDelay: '200ms' }}></div>
                  <div className={`absolute top-12 left-1/2 -translate-x-1/2 h-0.5 bg-white/20 animate-fade-in ${numProblems === 1 ? 'w-0' : 'w-4/5 lg:w-3/4'}`} style={{ animationDelay: '300ms' }}></div>
                  {problems.map((_, index) => {
                      const position = numProblems > 1 ? (index / (numProblems - 1)) * 80 + 10 : 50;
                      return <div key={index} className="absolute top-12 w-0.5 h-12 bg-white/20 animate-fade-in" style={{ left: `${position}%`, animationDelay: '400ms' }}></div>
                  })}
              </div>
          )}
  
          {/* Problems Row */}
          <div className="flex justify-around w-full gap-6">
              {problems.map((problem, index) => (
                  <div key={index} className="flex flex-col items-center gap-4 w-full animate-fade-in-up" style={{ animationDelay: `${500 + index * 100}ms` }}>
                      <div className="bg-brand-gray border border-white/10 rounded-xl p-4 text-center w-full max-w-xs shadow-md">
                          <h4 className="font-bold text-white">{problem.problemTitle}</h4>
                          <p className="text-sm text-brand-light-gray mt-1">{problem.description}</p>
                      </div>
                      <div className="w-0.5 h-4 bg-white/10"></div>
                      <div className="flex flex-col gap-2 w-full max-w-xs">
                          {problem.solvingCareers.map(career => (
                              <button
                                  key={career}
                                  onClick={() => onCareerClick(career)}
                                  className="group flex items-center justify-center text-center gap-2 w-full px-3 py-2 bg-black/20 text-brand-light-gray text-sm rounded-md hover:bg-brand-lime hover:text-brand-dark transition-all duration-200 hover:shadow-lg"
                              >
                                  <BriefcaseIcon className="w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                  <span className="truncate">{career}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    );
}


interface ProblemAccordionProps {
    problem: Problem;
    onCareerClick: (careerTitle: string) => void;
}

const ProblemAccordion: React.FC<ProblemAccordionProps> = ({ problem, onCareerClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-brand-gray border border-white/10 rounded-2xl overflow-hidden">
            <button 
                className="w-full flex justify-between items-center text-left p-5 hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <div>
                    <h3 className="text-xl font-bold text-white">{problem.problemTitle}</h3>
                    <p className="text-brand-light-gray mt-1">{problem.description}</p>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-brand-light-gray transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} flex-shrink-0 ml-4`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="px-5 pb-5 pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-white mb-3">Careers that can solve this:</h4>
                    <div className="flex flex-wrap gap-2">
                        {problem.solvingCareers.map(career => (
                            <button
                                key={career}
                                onClick={() => onCareerClick(career)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-black/20 text-brand-light-gray text-sm rounded-md hover:bg-brand-lime hover:text-brand-dark transition-colors"
                            >
                                <BriefcaseIcon className="w-4 h-4" />
                                <span>{career}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemExplorer;