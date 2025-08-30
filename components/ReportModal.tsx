import React, { useState, useEffect, useRef } from 'react';
import type { CareerReport } from '../types';
import { XIcon, BriefcaseIcon, StarIcon, ChartBarIcon, BookOpenIcon, LinkIcon, CheckCircleIcon, SparklesIcon, TrendingUpIcon, PlanetIcon, ChevronDownIcon, ExpandIcon, CollapseIcon, ChatBubbleIcon } from './Icon';

interface ReportModalProps {
  isLoading: boolean;
  report: CareerReport | null;
  error: string | null;
  onClose: () => void;
  progress: number;
  loadingMessage: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onBackToChat: () => void;
}

const engagingTidbits = [
    "Did you know? The average person changes careers 5-7 times during their life.",
    "Networking is key: 85% of all jobs are filled via networking.",
    "Soft skills like communication and problem-solving are in high demand across all industries.",
    "Learning is a lifelong journey. The most successful professionals are constant learners.",
    "AI is changing the job market, creating new roles we haven't even imagined yet."
];

const ReportModal: React.FC<ReportModalProps> = ({ isLoading, report, error, onClose, progress, loadingMessage, isFullScreen, onToggleFullScreen, onBackToChat }) => {
  const [tidbit, setTidbit] = useState(engagingTidbits[0]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTidbit(prev => {
          const currentIndex = engagingTidbits.indexOf(prev);
          const nextIndex = (currentIndex + 1) % engagingTidbits.length;
          return engagingTidbits[nextIndex];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const shouldBeFullScreen = isFullScreen || isMobile;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center lg:p-4 animate-fade-in bg-black/60 backdrop-blur-md" aria-modal="true" role="dialog">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
      <div className={`relative bg-brand-dark border border-white/10 flex flex-col shadow-2xl transition-all duration-500 ease-in-out
        ${shouldBeFullScreen 
          ? 'w-screen h-screen rounded-none' 
          : 'w-full max-w-4xl h-auto max-h-[90vh] rounded-2xl'}`
      }>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">{report ? `Report: ${report.careerTitle ?? 'Career'}`: 'Crafting Your Personalized Report...'}</h2>
           <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <button
                onClick={onToggleFullScreen}
                className="p-2 text-brand-light-gray hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullScreen ? <CollapseIcon className="w-5 h-5" /> : <ExpandIcon className="w-5 h-5" />}
              </button>
            )}
            {report && (
              <button
                onClick={onBackToChat}
                className="p-2 text-brand-light-gray hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Back to chat"
              >
                <ChatBubbleIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-brand-light-gray hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              aria-label="Close report modal"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4 py-16 sm:py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-brand-gray rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-brand-lime rounded-full animate-spin"></div>
                <div className="w-full h-full flex items-center justify-center text-brand-lime font-bold text-lg">
                  {Math.round(progress)}%
                </div>
              </div>
              <p className="mt-6 text-white text-lg font-semibold">{loadingMessage}</p>
              <div className="w-full bg-brand-gray rounded-full h-2 mt-4 overflow-hidden">
                  <div
                      className="bg-brand-lime h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                  ></div>
              </div>
              <p className="mt-8 text-brand-light-gray text-sm h-10 animate-fade-in-out">{tidbit}</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center text-center p-16">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                    <XIcon className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-red-300">Report Generation Failed</h3>
                <p className="mt-2 text-red-300/80 max-w-md">{error}</p>
                <button 
                    onClick={onClose} 
                    className="mt-8 px-5 py-2.5 bg-brand-lime text-brand-dark font-semibold rounded-full hover:bg-brand-lime-dark transition-colors"
                >
                    Close
                </button>
            </div>
          )}

          {!isLoading && !error && report && (
            <div className="space-y-8">
                {/* Row 1: Personalized Note */}
                {report.personalizedNotes && (
                  <div className="bg-brand-gray border border-brand-lime/30 p-4 rounded-lg">
                      <h3 className="font-bold text-lg text-brand-lime mb-2">A Personalized Note From Your AI Guide</h3>
                      <p className="text-brand-light-gray">{report.personalizedNotes}</p>
                  </div>
                )}
                
                {/* Row 2: Executive Summary */}
                <CollapsibleSection icon={BriefcaseIcon} title="Executive Summary & Career Snapshot" defaultOpen>
                  <p className="text-brand-light-gray mb-4">{report.executiveSummary?.careerDefinition ?? 'No definition provided.'}</p>
                  <p className="text-brand-light-gray italic mb-6">"{report.executiveSummary?.whyItMatters ?? 'No details provided.'}"</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <InfoBox title="Experience Level" value={report.executiveSummary?.keyVitals?.averageExperienceLevel ?? 'N/A'} />
                    <InfoBox title="Work Environment" value={report.executiveSummary?.keyVitals?.workEnvironment ?? 'N/A'} />
                    <InfoBox title="Work Hours" value={report.executiveSummary?.keyVitals?.typicalWorkHours ?? 'N/A'} />
                    <InfoBox title="Education" value={report.executiveSummary?.keyVitals?.requiredEducationLevel ?? 'N/A'} />
                  </div>
                </CollapsibleSection>

                {/* Row 3: Core Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8"> {/* Left Column */}
                        <CollapsibleSection icon={TrendingUpIcon} title="Market Demand & Future Outlook">
                          <h4 className="font-semibold text-white text-lg mb-2">Job Posting Trends</h4>
                          <p className="text-sm text-brand-light-gray mb-4">A visual representation of interest and job postings over the last 5 years.</p>
                          <TrendChart data={report.marketDemand?.careerGrowthAndDemand?.jobPostingTrendsGraphData ?? []} />
                          <h4 className="font-semibold text-white text-lg mb-2 mt-8">AI Disruption & Automation Risk</h4>
                          <div className="bg-brand-gray p-4 rounded-lg flex items-start sm:items-center gap-4 mb-4 flex-col sm:flex-row">
                              <span className="text-2xl font-bold text-brand-lime whitespace-nowrap">{report.marketDemand?.aiDisruptionAndAutomationRisk?.automationRiskScore ?? 'N/A'} Risk</span>
                              <p className="text-sm text-brand-light-gray">{report.marketDemand?.aiDisruptionAndAutomationRisk?.rationale ?? 'No rationale provided.'}</p>
                          </div>
                          <p className="text-brand-light-gray">{report.marketDemand?.aiDisruptionAndAutomationRisk?.analysis ?? 'No analysis provided.'}</p>
                        </CollapsibleSection>
                        <CollapsibleSection icon={BookOpenIcon} title="A Day in the Life & Required Skills">
                          <p className="text-brand-light-gray mb-6">{report.dayInTheLife?.typicalDay ?? 'No description provided.'}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-white mb-2">Hard Skills</h4>
                              <ul className="list-disc list-inside space-y-1 text-brand-light-gray">
                                {(report.dayInTheLife?.hardSkills ?? []).map(skill => <li key={skill}>{skill}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-2">Soft Skills</h4>
                              <ul className="list-disc list-inside space-y-1 text-brand-light-gray">
                                {(report.dayInTheLife?.softSkills ?? []).map(skill => <li key={skill}>{skill}</li>)}
                              </ul>
                            </div>
                          </div>
                        </CollapsibleSection>
                    </div>
                    <div className="space-y-8"> {/* Right Column */}
                         <CollapsibleSection icon={ChartBarIcon} title="Financial Insights">
                          <h4 className="font-semibold text-white text-lg mb-3">Salary Ranges ({report.financialInsights?.salaryData?.entryLevel?.currency ?? 'USD'})</h4>
                          <div className="space-y-4 mb-4">
                            <SalaryBar level="Entry-Level" data={report.financialInsights?.salaryData?.entryLevel} max={report.financialInsights?.salaryData?.seniorLevel?.high ?? 100000} />
                            <SalaryBar level="Mid-Level" data={report.financialInsights?.salaryData?.midLevel} max={report.financialInsights?.salaryData?.seniorLevel?.high ?? 100000} />
                            <SalaryBar level="Senior-Level" data={report.financialInsights?.salaryData?.seniorLevel} max={report.financialInsights?.salaryData?.seniorLevel?.high ?? 100000} />
                          </div>
                          <p className="text-sm text-brand-light-gray italic mb-6">{report.financialInsights?.compensationDetails ?? 'No details provided.'}</p>
                          <h4 className="font-semibold text-white text-lg mb-2">Geographic Variance</h4>
                          <p className="text-brand-light-gray">{report.financialInsights?.geographicVariance ?? 'No details provided.'}</p>
                        </CollapsibleSection>
                        <CollapsibleSection icon={SparklesIcon} title="Your Actionable Path">
                          <p className="text-brand-light-gray mb-6">Common degree paths: {(report.actionablePath?.educationalPathways?.degreePaths ?? []).join(', ') || 'N/A'}</p>

                          <h4 className="font-semibold text-white text-lg mb-3">Tier 1: Top-Tier & Aspirational Universities</h4>
                          <div className="space-y-3 mb-8">
                            {(report.actionablePath?.educationalPathways?.topTierUniversities ?? []).map(uni => (
                              <ResourceItem 
                                key={uni.name} 
                                name={uni.rank ? `#${uni.rank} ${uni.name}` : uni.name} 
                                url={uni.url} 
                                tags={[uni.estimatedAnnualTuition]} 
                              />
                            ))}
                          </div>

                          <h4 className="font-semibold text-white text-lg mb-3">Tier 2: Accessible Public Universities</h4>
                          <div className="space-y-3 mb-8">
                            {(report.actionablePath?.educationalPathways?.accessiblePublicUniversities ?? []).map(uni => (
                              <ResourceItem 
                                key={uni.name} 
                                name={uni.rank ? `#${uni.rank} ${uni.name}` : uni.name}
                                url={uni.url} 
                                tags={[uni.estimatedAnnualTuition]} 
                              />
                            ))}
                          </div>

                          <h4 className="font-semibold text-white text-lg mb-3">Tier 3: Skill-First & Alternative Pathways</h4>
                          <h5 className="font-semibold text-brand-light-gray mb-2">Industry-Recognized Certifications</h5>
                          <div className="space-y-3 mb-6">
                            {(report.actionablePath?.skillFirstPathways?.recognizedCertifications ?? []).map(cert => (
                              <ResourceItem 
                                key={cert.name} 
                                name={`${cert.name} by ${cert.issuingBody}`}
                                url={cert.url}
                                tags={[cert.estimatedCost, cert.timeToComplete]}
                              />
                            ))}
                          </div>
                          
                          <h5 className="font-semibold text-brand-light-gray mb-2">Top-Rated Online Courses & Bootcamps</h5>
                          <div className="space-y-3 mb-8">
                            {(report.actionablePath?.skillFirstPathways?.topOnlineCourses ?? []).map(course => (
                              <ResourceItem 
                                key={course.name} 
                                name={`${course.name} on ${course.platform}`}
                                url={course.url}
                                tags={[course.estimatedCost, course.timeToComplete]}
                              />
                            ))}
                          </div>

                          <h4 className="font-semibold text-white text-lg mb-3 mt-8">First Steps for a Beginner</h4>
                          <ul className="list-decimal list-inside space-y-2 text-brand-light-gray">
                            {(report.actionablePath?.firstStepsForBeginner ?? []).map(step => <li key={step}>{step}</li>)}
                          </ul>
                        </CollapsibleSection>
                    </div>
                </div>

                {/* Row 4: Personal Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {report.astrologicalInsight && (
                      <CollapsibleSection icon={PlanetIcon} title="Astrological Insight">
                          {report.astrologicalInsight.compatibilityScore && (
                            <div className="flex items-center justify-center gap-4 bg-brand-gray p-4 rounded-lg mb-4">
                                <div>
                                    <p className="text-sm text-brand-light-gray">Career Compatibility</p>
                                    <p className="text-3xl font-bold text-brand-lime">{report.astrologicalInsight.compatibilityScore.toFixed(1)} <span className="text-lg text-brand-light-gray">/ 10</span></p>
                                </div>
                            </div>
                          )}
                          <p className="text-brand-light-gray italic text-sm">
                              {report.astrologicalInsight.insight}
                          </p>
                          <p className="text-xs text-brand-light-gray/50 mt-2">For entertainment purposes only.</p>
                      </CollapsibleSection>
                    )}
                    {report.sources && report.sources.length > 0 && (
                      <CollapsibleSection icon={LinkIcon} title="Data Sources">
                        <div className="space-y-2">
                              {report.sources.map(item => (
                                <a href={item.uri} target="_blank" rel="noopener noreferrer" key={item.uri} className="flex items-center gap-2 text-brand-light-gray hover:text-brand-lime group text-sm">
                                  <LinkIcon className="w-4 h-4 text-brand-light-gray/50 group-hover:text-brand-lime transition-colors flex-shrink-0" />
                                  <span className="underline-offset-2 group-hover:underline truncate">{item.title}</span>
                                </a>
                              ))}
                          </div>
                      </CollapsibleSection>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="bg-brand-gray/50 border border-white/10 rounded-xl overflow-hidden">
      <button
        className="flex items-center justify-between w-full gap-3 p-4"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-brand-lime flex-shrink-0" />
            <h3 className="text-xl font-bold text-white text-left">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-brand-light-gray transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4">
            <div className="border-l-2 border-brand-lime/30 pl-6 ml-3 py-2">
                {children}
            </div>
        </div>
      </div>
    </section>
  );
};

const InfoBox: React.FC<{title: string, value: string}> = ({ title, value }) => (
    <div className="bg-brand-gray p-3 rounded-lg">
        <h5 className="text-sm font-semibold text-brand-light-gray truncate">{title}</h5>
        <p className="text-md font-bold text-white mt-1 truncate">{value}</p>
    </div>
);

const TrendChart: React.FC<{ data: Array<{ year: number, trend: number }>}> = ({ data }) => {
    const [activePoint, setActivePoint] = useState<{ x: number; y: number; year: number; trend: number } | null>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [data]);

    if (!data || data.length < 2) {
        return <div className="flex items-center justify-center min-h-[300px] text-center text-sm text-brand-light-gray/70 p-4 bg-brand-gray rounded-lg">Not enough trend data to draw a chart.</div>;
    }

    const svgWidth = 500;
    const svgHeight = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 30 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const xMin = Math.min(...data.map(d => d.year));
    const xMax = Math.max(...data.map(d => d.year));
    const yMin = 0;
    const yMax = 100;

    const xScale = (year: number) => padding.left + ((year - xMin) / (xMax - xMin)) * chartWidth;
    const yScale = (trend: number) => padding.top + chartHeight - ((trend - yMin) / (yMax - yMin)) * chartHeight;

    const pathData = data
        .map((p, i) => {
            const x = xScale(p.year);
            const y = yScale(p.trend);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
        
    const points = data.map(p => ({
        x: xScale(p.year),
        y: yScale(p.trend),
        year: p.year,
        trend: p.trend,
    }));
    
    const gridLines = [0, 25, 50, 75, 100];

    return (
        <div className="relative w-full min-h-[300px] bg-brand-gray p-4 rounded-lg">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                {gridLines.map(value => (
                    <line
                        key={value}
                        x1={padding.left}
                        y1={yScale(value)}
                        x2={svgWidth - padding.right}
                        y2={yScale(value)}
                        stroke="#A0A1A4"
                        strokeWidth="0.5"
                        strokeOpacity="0.2"
                    />
                ))}

                <path
                    ref={pathRef}
                    d={pathData}
                    fill="none"
                    stroke="#D0FD3E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        strokeDasharray: pathLength,
                        strokeDashoffset: pathLength,
                        animation: 'drawLine 2s ease-out forwards',
                    }}
                />
                
                {points.map((point, i) => (
                    <g key={i}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#D0FD3E"
                            stroke="#1a1c1e"
                            strokeWidth="2"
                        />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="15"
                            fill="transparent"
                            onMouseEnter={() => setActivePoint(point)}
                            onMouseLeave={() => setActivePoint(null)}
                            className="cursor-pointer"
                        />
                    </g>
                ))}

                {data.map(({ year }) => (
                    <text
                        key={year}
                        x={xScale(year)}
                        y={svgHeight - padding.bottom + 20}
                        textAnchor="middle"
                        fill="#A0A1A4"
                        fontSize="12"
                    >
                        {year}
                    </text>
                ))}
            </svg>

            {activePoint && (
                <div
                    className="absolute bg-brand-lime text-brand-dark text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none transition-opacity duration-200"
                    style={{
                        left: `${(activePoint.x / svgWidth) * 100}%`,
                        top: `${(activePoint.y / svgHeight) * 100}%`,
                        transform: `translate(-50%, -150%)`,
                        opacity: 1,
                    }}
                >
                    {activePoint.year}: {activePoint.trend}%
                </div>
            )}

            <style>{`
                @keyframes drawLine {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
};

const SalaryBar: React.FC<{level: string, data?: {low: number, high: number, currency: string}, max: number}> = ({ level, data, max }) => {
    if (!data || typeof data.low !== 'number' || typeof data.high !== 'number' || !data.currency) {
      return (
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <h5 className="text-sm font-semibold text-brand-light-gray">{level}</h5>
            <p className="text-sm text-brand-light-gray/70">Not Available</p>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3"></div>
        </div>
      );
    }

    const safeMax = max > 0 ? max : data.high;
    const format = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency, maximumFractionDigits: 0 }).format(val);
    const lowPercent = (data.low / safeMax) * 100;
    const highPercent = (data.high / safeMax) * 100;

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1 text-sm">
                <h5 className="font-semibold text-brand-light-gray">{level}</h5>
                <p className="font-bold text-white">{format(data.low)} - {format(data.high)}</p>
            </div>
            <div className="relative w-full h-2 my-1 bg-brand-gray rounded-full">
                <div 
                    className="absolute h-2 bg-brand-lime rounded-full" 
                    style={{ left: `${lowPercent}%`, width: `${Math.max(0, highPercent - lowPercent)}%` }}
                />
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-lime rounded-full"
                    style={{ left: `${lowPercent}%`, transform: 'translateX(-50%)' }}
                />
            </div>
        </div>
    );
};

const ResourceItem: React.FC<{ name: string; url?: string; tags: (string | undefined)[] }> = ({ name, url, tags }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-brand-dark rounded-lg border border-white/10 hover:border-brand-lime/50 transition-colors group">
        <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-white group-hover:text-brand-lime transition-colors">{name}</p>
            {url && <LinkIcon className="w-4 h-4 text-brand-light-gray/50 group-hover:text-brand-lime transition-colors flex-shrink-0 mt-1" />}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
            {tags.filter(Boolean).map(tag => (
                <span key={tag as string} className="px-2 py-0.5 bg-black/40 text-xs text-brand-light-gray rounded-full">{tag}</span>
            ))}
        </div>
    </a>
);


export default ReportModal;
