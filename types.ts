export interface Career {
  id: string;
  title: string;
  emoji: string;
  summary?: string;
  automationRisk?: 'Low' | 'Medium' | 'High';
  demandGrowth?: 'Low' | 'Medium' | 'High';
  isEmerging?: boolean;
  whoThisIsFor?: string[];
  relatedCareers?: string[];
}

export interface Persona {
  title: string;
  tagline: string;
  description: string;
  image: string;
  icon: React.FC<{ className?: string }>;
}

export interface Problem {
  problemTitle: string;
  description: string;
  solvingCareers: string[];
}

export interface PersonaProblemSet {
  personaTitle: string;
  problems: Problem[];
}


export interface LifecycleStage {
  stageName: string;
  emoji: string;
  description: string;
  careers: string[];
}

export interface UnpackedObject {
  objectName: string;
  lifecycle: LifecycleStage[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface PersonalizationData {
  age: number | null;
  country: string;
  isOpenToAbroad: boolean;
  astrology?: {
    dateOfBirth: string; // YYYY-MM-DD
    timeOfBirth: string; // HH:MM
    placeOfBirth: string;
  };
}

export interface UniversityInfo {
  name: string;
  estimatedAnnualTuition: string;
  rank?: number;
  url?: string;
}

export interface CertificationInfo {
  name: string;
  issuingBody: string;
  estimatedCost: string;
  timeToComplete: string;
  url?: string;
}

export interface OnlineCourseInfo {
  name: string;
  platform: string;
  estimatedCost: string;
  timeToComplete: string;
  url: string;
}

export interface CareerReport {
  careerTitle: string;
  personalizedNotes?: string;
  executiveSummary: {
    careerDefinition: string;
    whyItMatters: string;
    keyVitals: {
      averageExperienceLevel: 'Entry' | 'Mid-level' | 'Senior';
      workEnvironment: string;
      typicalWorkHours: string;
      requiredEducationLevel: string;
    };
  };
  marketDemand: {
    careerGrowthAndDemand: {
      currentDemandAnalysis: string;
      projected10YearGrowth: {
        percentage: number;
        description: string;
      };
      jobPostingTrendsGraphData: Array<{ year: number; trend: number; }>;
    };
    aiDisruptionAndAutomationRisk: {
      analysis: string;
      automationRiskScore: 'Low' | 'Medium' | 'High';
      rationale: string;
    };
  };
  financialInsights: {
    salaryData: {
      entryLevel: { low: number; high: number; currency: string; };
      midLevel: { low: number; high: number; currency:string; };
      seniorLevel: { low: number; high: number; currency:string; };
    };
    compensationDetails: string;
    topPayingCompanies: string[];
    geographicVariance: string;
  };
  dayInTheLife: {
    typicalDay: string;
    hardSkills: string[];
    softSkills: string[];
  };
  isThisForYou: {
    pros: string[];
    cons: string[];
    personalityProfile: string;
  };
  actionablePath: {
    educationalPathways: {
      degreePaths: string[];
      topTierUniversities: UniversityInfo[];
      accessiblePublicUniversities: UniversityInfo[];
    };
    skillFirstPathways: {
      recognizedCertifications: CertificationInfo[];
      topOnlineCourses: OnlineCourseInfo[];
    };
    firstStepsForBeginner: string[];
  };
  astrologicalInsight?: {
    insight: string;
    compatibilityScore?: number;
  };
  sources: Array<{ title: string; uri: string; }>;
}


export enum AppView {
  Home = 'HOME',
  Results = 'RESULTS',
  PersonaGallery = 'PERSONA_GALLERY',
  ProblemExplorer = 'PROBLEM_EXPLORER',
  UnpackHome = 'UNPACK_HOME',
  UnpackResults = 'UNPACK_RESULTS',
  Contact = 'CONTACT',
}

export enum ExploreTab {
  Curiosity = 'CURIOSITY',
  Persona = 'PERSONA',
  Unpack = 'UNPACK',
}