import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import { AppView, ExploreTab } from './types';
import type { Career, Persona, UnpackedObject, PersonaProblemSet, CareerReport, PersonalizationData } from './types';
import Header from './components/Header';
import { discoverCareerSkeletons, unpackObjectCareers, getPersonaProblems, generateCareerReport, generatePersona, discoverMoreCareerSkeletons, hydrateCareerQuickLook } from './services/geminiService';
import CareerCard from './components/CareerCard';
import LoadingSpinner from './components/LoadingSpinner';
import ChatModal from './components/ChatModal';
import ReportModal from './components/ReportModal';
import LifecycleTimeline from './components/LifecycleTimeline';
import ProblemExplorer from './components/ProblemExplorer';
import PersonaView from './components/PersonaView';
import ContactView from './components/ContactView';
import UnpackView from './components/UnpackView';
import { BackArrowIcon, CompassIcon, MusicianIcon, EntrepreneurIcon, SearchIcon, BriefcaseIcon, StarIcon, SparklesIcon, VideoGameIcon, QuillPenIcon, PlusIcon } from './components/Icon';

const predefinedPersonas: Persona[] = [
  {
    title: 'The Aspiring Musician',
    tagline: 'Help them find a way to share their music with the world and build a fanbase.',
    description: 'Turning passion into a profession.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=500&auto=format&fit=crop',
    icon: MusicianIcon,
  },
  {
    title: 'The Small Cafe Owner',
    tagline: 'Help them attract more customers and manage their small business efficiently.',
    description: 'Brewing community one cup at a time.',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=500&auto=format&fit=crop',
    icon: EntrepreneurIcon,
  },
  {
    title: 'The First-Time Homeowner',
    tagline: 'Help them navigate the complexities of maintaining a home and making smart financial decisions.',
    description: 'Building a life from the ground up.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=500&auto=format&fit=crop',
    icon: BriefcaseIcon,
  },
  {
    title: 'The Indie Game Developer',
    tagline: 'Help them build their dream game and find an audience in a crowded market.',
    description: 'Crafting interactive worlds alone.',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=500&auto=format&fit=crop',
    icon: VideoGameIcon,
  },
  {
    title: 'The Remote Worker',
    tagline: 'Help them find work-life balance and stay connected with their team from anywhere.',
    description: 'Navigating the world of distributed teams.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=500&auto=format&fit=crop',
    icon: SparklesIcon,
  },
  {
    title: 'The Fitness Enthusiast',
    tagline: 'Help them optimize their training, nutrition, and recovery to reach peak performance.',
    description: 'Pushing the limits of physical potential.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500&auto=format&fit=crop',
    icon: SparklesIcon,
  },
  {
    title: 'The Aspiring Author',
    tagline: 'Help them craft compelling stories and find a platform to publish their work.',
    description: 'Weaving words into worlds.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=500&auto=format&fit=crop',
    icon: QuillPenIcon,
  },
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [activeTab, setActiveTab] = useState<ExploreTab>(ExploreTab.Curiosity);
  const [curiosityInput, setCuriosityInput] = useState<string>('');
  const [unpackInput, setUnpackInput] = useState<string>('');
  const [unpackedResult, setUnpackedResult] = useState<UnpackedObject | null>(null);
  const [searchResults, setSearchResults] = useState<Career[]>([]);
  const [hydratingCareerIds, setHydratingCareerIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat & Report State
  const [chatModalCareer, setChatModalCareer] = useState<Career | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportData, setReportData] = useState<CareerReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportGenerationProgress, setReportGenerationProgress] = useState<number>(0);
  const [reportGenerationMessage, setReportGenerationMessage] = useState<string>('');
  const [isReportVisible, setIsReportVisible] = useState<boolean>(false);
  const [isReportFullScreen, setIsReportFullScreen] = useState<boolean>(false);


  // Persona State
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [personaProblems, setPersonaProblems] = useState<PersonaProblemSet | null>(null);
  const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Warn user before leaving page if report is generating
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isGeneratingReport) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGeneratingReport]);


  const handleSearch = useCallback(async () => {
    if (!curiosityInput.trim()) {
      setError("Please describe your interests before discovering careers.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setHydratingCareerIds(new Set());
    setCanLoadMore(true);
    setCurrentView(AppView.Results);

    try {
        const skeletons = await discoverCareerSkeletons(curiosityInput);
        setSearchResults(skeletons);
    } catch(err) {
        console.error(err);
        setError('Sorry, something went wrong while discovering careers. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }, [curiosityInput]);

  const handleHydrateCareer = useCallback(async (careerId: string) => {
    const targetCareer = searchResults.find(c => c.id === careerId);
    // Exit if career doesn't exist, is already hydrated, or is currently hydrating
    if (!targetCareer || targetCareer.summary || hydratingCareerIds.has(careerId)) {
      return;
    }

    setHydratingCareerIds(prev => new Set(prev).add(careerId));

    try {
      const details = await hydrateCareerQuickLook(targetCareer.title);
      setSearchResults(prev => prev.map(c => 
        c.id === careerId ? { ...c, ...details } : c
      ));
    } catch (e) {
      console.error(`Failed to hydrate career ${careerId}:`, e);
      // Optional: Handle hydration error state on the card itself
    } finally {
      setHydratingCareerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(careerId);
        return newSet;
      });
    }
  }, [searchResults, hydratingCareerIds]);


  const handleLoadMore = useCallback(async () => {
    if (!curiosityInput.trim() || isLoadingMore) {
        return;
    }

    setIsLoadingMore(true);
    setError(null);
    
    const existingIds = searchResults.map(c => c.id);

    try {
        const skeletons = await discoverMoreCareerSkeletons(curiosityInput, existingIds);
        if (skeletons.length < 4) {
            setCanLoadMore(false);
        }
        setSearchResults(prev => [...prev, ...skeletons]);
    } catch(err) {
        console.error(err);
        setError('Sorry, something went wrong while loading more careers. Please try again.');
    } finally {
        setIsLoadingMore(false);
    }
  }, [curiosityInput, searchResults, isLoadingMore]);

  const handleUnpackSearch = useCallback(async (objectName: string) => {
    if (!objectName.trim()) {
        setError("Please enter an object to unpack.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setUnpackInput(objectName);
    setCurrentView(AppView.UnpackResults);

    try {
        const result = await unpackObjectCareers(objectName);
        setUnpackedResult(result);
    } catch (e) {
        console.error(e);
        setError('Sorry, something went wrong while unpacking the object. Please try again.');
        setUnpackedResult(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleSelectPersona = useCallback(async (persona: Persona) => {
    setSelectedPersona(persona);
    setCurrentView(AppView.ProblemExplorer);
    setIsLoading(true);
    setError(null);
    setPersonaProblems(null);

    try {
        const results = await getPersonaProblems(persona);
        setPersonaProblems(results);
    } catch (e) {
        console.error(e);
        setError('Sorry, we couldn\'t generate problems for this persona. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleGeneratePersona = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
        setGenerationError("Please enter a description to generate a persona.");
        return;
    }

    setIsGeneratingPersona(true);
    setGenerationError(null);

    try {
        const result = await generatePersona(prompt);
        const newPersona: Persona = {
            title: result.title,
            tagline: result.tagline,
            description: result.description,
            image: `https://source.unsplash.com/500x500/?${encodeURIComponent(result.imageQuery)}&sig=${Math.random()}`,
            icon: SparklesIcon,
        };

        // Automatically select the new persona and move to the next step
        await handleSelectPersona(newPersona);
        
    } catch (e) {
        console.error(e);
        setGenerationError('Sorry, we couldn\'t generate a persona from that description. Please try again.');
        // Go back to gallery view if generation fails after trying to select
        setCurrentView(AppView.PersonaGallery);
    } finally {
        setIsGeneratingPersona(false);
    }
  }, [handleSelectPersona]);

  const handleRequestChatSession = (career: Career) => {
    // This is now an instant action.
    setReportData(null); // Clear previous report when starting new chat
    setReportError(null);
    setIsReportVisible(false);
    setIsReportFullScreen(false);

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert career counselor. The user is asking about the role of a "${career.title}". Your answers should be helpful, encouraging, and focused on providing practical information about this specific career. Be concise and conversational.`,
        },
    });
    setChatSession(chat);
    setChatModalCareer(career);
  };

  const handleCloseSession = () => {
    setChatModalCareer(null);
    setChatSession(null);
    setReportData(null);
    setReportError(null);
    setIsReportVisible(false);
    setIsGeneratingReport(false);
    setIsReportFullScreen(false);
  };

  const handleOpenChatModalForTitle = (title: string) => {
    // This is used by other views. We create a partial career and request a session.
    const partialCareer: Career = {
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      emoji: '✨',
      summary: `A professional in the ${title} field.`, // Provide a minimal summary
    };
    handleRequestChatSession(partialCareer);
  };

  const handleGenerateReportRequest = async (career: Career, personalizationData: PersonalizationData) => {
    setIsReportVisible(true);
    setIsGeneratingReport(true);
    setReportData(null);
    setReportError(null);
    setReportGenerationProgress(0);

    const messages = [
        `Crafting your personalized report for a ${career.title}...`,
        "Consulting real-time job market data...",
        `Analyzing salary databases for ${personalizationData.country}...`,
        "Assessing future growth and AI impact...",
        "Compiling actionable first steps based on your profile...",
        "Finalizing your comprehensive report...",
    ];
    let messageIndex = 0;
    setReportGenerationMessage(messages[0]);

    const progressInterval = setInterval(() => {
        setReportGenerationProgress(prev => {
            const next = prev + Math.random() * 10;
            return Math.min(next, 95); // Cap at 95% until done
        });
    }, 800);

    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setReportGenerationMessage(messages[messageIndex]);
    }, 2500);


    try {
        const report = await generateCareerReport(career.title, personalizationData);
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setReportGenerationProgress(100);
        setReportGenerationMessage("Success! Your report is ready.");
        setTimeout(() => {
            setReportData(report);
            setIsGeneratingReport(false);
        }, 500);
    } catch(e) {
        console.error("Report generation failed", e);
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setReportError("Sorry, we couldn't generate the report. It might be a network issue or the topic is too niche. Please try again later.");
        setIsGeneratingReport(false);
    }
  }

  const handleShowReport = () => setIsReportVisible(true);
  const handleBackToChat = () => setIsReportVisible(false);
  const handleToggleReportFullScreen = () => setIsReportFullScreen(prev => !prev);


  const resetToHome = () => {
    setCurrentView(AppView.Home);
    setSearchResults([]);
    setUnpackedResult(null);
    setSelectedPersona(null);
    setPersonaProblems(null);
    setError(null);
    setCuriosityInput('');
    setUnpackInput('');
    setCanLoadMore(true);
    setIsLoadingMore(false);
  };
  
  const renderHome = () => {
    const isCuriosityInputFilled = curiosityInput.trim().length > 0;

    return (
      <main className="container mx-auto px-4 pt-32 sm:pt-40 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight">
          Discover Your <br />
          <span className="text-brand-lime">Perfect Career</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-brand-light-gray">
          AI-powered career exploration to find your ideal path through curiosity,
          persona, or industry
        </p>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-brand-gray rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-black/20 p-1.5 rounded-xl">
              <TabButton
                  label="Curiosity"
                  isActive={activeTab === ExploreTab.Curiosity}
                  onClick={() => setActiveTab(ExploreTab.Curiosity)}
              />
              <TabButton
                  label="Persona"
                  isActive={activeTab === ExploreTab.Persona}
                  onClick={() => setActiveTab(ExploreTab.Persona)}
              />
              <TabButton
                  label="Unpack"
                  isActive={activeTab === ExploreTab.Unpack}
                  onClick={() => setActiveTab(ExploreTab.Unpack)}
              />
              </div>

              <div className="mt-6 text-left">
              {activeTab === ExploreTab.Curiosity && (
                  <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-white">What are you curious about?</h2>
                  <p className="mt-2 text-brand-light-gray">
                      Describe your interests, passions, or problems you'd like to solve. Our AI will find careers that match your curiosity.
                  </p>
                  <textarea
                      value={curiosityInput}
                      onChange={(e) => setCuriosityInput(e.target.value)}
                      placeholder="e.g., I'm passionate about space exploration, creative writing, and helping animals..."
                      className="w-full h-32 mt-4 p-4 bg-black/20 rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all"
                  />
                  <button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className={`w-full mt-4 py-3 font-semibold rounded-xl transition-colors disabled:bg-black/10 disabled:text-brand-light-gray/50 disabled:cursor-not-allowed ${
                        isCuriosityInputFilled
                          ? 'bg-brand-lime text-brand-dark hover:bg-brand-lime-dark'
                          : 'bg-black/20 text-brand-light-gray/80 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                      {isLoading ? 'Discovering...' : 'Discover Careers'}
                  </button>
                  </div>
              )}
              {activeTab === ExploreTab.Persona && (
                <div className="animate-fade-in text-center">
                    <h2 className="text-xl font-semibold text-white">Explore Via Persona</h2>
                    <p className="mt-2 text-brand-light-gray max-w-md mx-auto">
                        Step into someone else's shoes. Discover careers by solving problems for unique, AI-generated character profiles.
                    </p>
                    <button
                        onClick={() => setCurrentView(AppView.PersonaGallery)}
                        className="w-full sm:w-auto mt-6 py-3 px-8 bg-brand-lime text-brand-dark font-semibold rounded-xl hover:bg-brand-lime-dark transition-colors"
                    >
                        Choose a Persona
                    </button>
                </div>
              )}
              {activeTab === ExploreTab.Unpack && (
                   <div className="animate-fade-in text-center">
                      <h2 className="text-xl font-semibold text-white">Unpack an Object</h2>
                      <p className="mt-2 text-brand-light-gray max-w-md mx-auto">
                         Deconstruct everyday objects to reveal the hidden network of careers that bring them to life.
                      </p>
                      <button
                          onClick={() => setCurrentView(AppView.UnpackHome)}
                          className="w-full sm:w-auto mt-6 py-3 px-8 bg-brand-lime text-brand-dark font-semibold rounded-xl hover:bg-brand-lime-dark transition-colors"
                      >
                          Start Unpacking
                      </button>
                  </div>
              )}
              </div>
          </div>
        </div>
        
        {error && <p className="mt-4 text-red-400">{error}</p>}

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureStat title="10,000+" description="Career paths explored" />
          <FeatureStat title="AI-Powered" description="Personalized matching" />
          <FeatureStat title="Real-time" description="Market insights" />
        </div>
      </main>
    );
  };

  const renderResults = () => (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Your Career Universe
          </h1>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <p className="text-brand-light-gray text-lg">Based on:</p>
            <span className="inline-block bg-brand-gray border border-white/10 px-4 py-1.5 rounded-full text-white text-md font-medium truncate max-w-full sm:max-w-md">
              "{curiosityInput}"
            </span>
          </div>
        </div>
        <button onClick={resetToHome} className="group flex items-center gap-2 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-5 py-2.5 rounded-full transition-all">
          <BackArrowIcon className="w-5 h-5 transition-transform" />
          <span>New Search</span>
        </button>
      </div>
      
      {isLoading && searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <LoadingSpinner />
          <p className="mt-6 text-white text-lg font-semibold">Analyzing your curiosity...</p>
          <p className="text-brand-light-gray">Building your personalized career universe.</p>
        </div>
      ) : !isLoading && searchResults.length === 0 && !error ? (
        <div className="text-center py-20 bg-brand-gray border border-white/10 rounded-2xl">
          <CompassIcon className="w-16 h-16 text-brand-lime mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-white">No Careers Found</h2>
          <p className="mt-2 max-w-md mx-auto text-brand-light-gray">
            We couldn't find any matching careers for that query. Try being a bit more descriptive or exploring a different passion!
          </p>
          <button onClick={resetToHome} className="group mt-8 flex items-center mx-auto gap-2 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-5 py-2.5 rounded-full transition-all">
            <BackArrowIcon className="w-5 h-5 transition-transform" />
            <span>Try a New Search</span>
          </button>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <p className="mb-8 text-brand-light-gray">
            Showing <span className="font-bold text-white">{searchResults.length} career paths</span>. Click any card to expand and explore.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((career, index) => (
              <CareerCard 
                key={career.id}
                career={career}
                onExpandRequest={() => handleHydrateCareer(career.id)}
                isHydrating={hydratingCareerIds.has(career.id)}
                onGoInDepth={() => handleRequestChatSession(career)}
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>

          {!isLoading && searchResults.length > 0 && canLoadMore && (
            <div className="text-center mt-10">
                <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="group flex items-center justify-center mx-auto gap-3 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-6 py-3 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoadingMore ? (
                        <>
                            <div className="w-5 h-5 border-2 border-brand-dark/50 border-t-brand-dark rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <span>Load More Careers</span>
                            <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        </>
                    )}
                </button>
            </div>
          )}

        </>
      ) : null}

      {error && !isLoading && (
         <div className="text-center py-20 bg-red-900/20 border border-red-500/30 rounded-2xl mt-8">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="mt-2 max-w-md mx-auto text-red-300/80">{error}</p>
         </div>
      )}
    </main>
  );

  const renderPersonaGallery = () => (
    <PersonaView
      personas={[...generatedPersonas, ...predefinedPersonas]}
      onSelectPersona={handleSelectPersona}
      onBack={resetToHome}
      onGeneratePersona={handleGeneratePersona}
      isGenerating={isGeneratingPersona}
      generationError={generationError}
    />
  );

  const renderProblemExplorer = () => {
    if (!selectedPersona) return renderPersonaGallery();
    return (
      <ProblemExplorer
        persona={selectedPersona}
        problemsData={personaProblems}
        isLoading={isLoading}
        error={error}
        onBack={() => {
          setError(null);
          setCurrentView(AppView.PersonaGallery)
        }}
        onCareerClick={handleOpenChatModalForTitle}
      />
    );
  };

  const renderUnpackResults = () => (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
       <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Unpacking: <span className="text-brand-lime">{unpackedResult?.objectName || unpackInput}</span>
          </h1>
          <p className="text-brand-light-gray text-lg mt-3">The lifecycle and careers behind your object.</p>
        </div>
        <button onClick={() => setCurrentView(AppView.UnpackHome)} className="group flex items-center gap-2 text-brand-dark bg-brand-lime hover:bg-brand-lime-dark font-semibold px-5 py-2.5 rounded-full transition-all">
          <BackArrowIcon className="w-5 h-5 transition-transform" />
          <span>New Unpack</span>
        </button>
      </div>
       {isLoading ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <LoadingSpinner />
          <p className="mt-6 text-white text-lg font-semibold">Deconstructing your object...</p>
          <p className="text-brand-light-gray">Revealing the hidden careers within.</p>
        </div>
      ) : error ? (
         <div className="text-center py-20 bg-red-900/20 border border-red-500/30 rounded-2xl">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="mt-2 max-w-md mx-auto text-red-300/80">{error}</p>
         </div>
      ) : unpackedResult ? (
        <LifecycleTimeline unpackedObject={unpackedResult} onCareerClick={handleOpenChatModalForTitle} />
      ) : (
         <div className="text-center py-20 bg-brand-gray border border-white/10 rounded-2xl">
          <CompassIcon className="w-16 h-16 text-brand-lime mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-white">Could Not Unpack Object</h2>
          <p className="mt-2 max-w-md mx-auto text-brand-light-gray">
            We couldn't generate a lifecycle for that object. It might be too abstract or complex. Please try another.
          </p>
        </div>
      )}
    </main>
  );

  const renderContent = () => {
    switch(currentView) {
        case AppView.Home: return renderHome();
        case AppView.Results: return renderResults();
        case AppView.PersonaGallery: return renderPersonaGallery();
        case AppView.ProblemExplorer: return renderProblemExplorer();
        case AppView.UnpackHome: return <UnpackView onSearch={handleUnpackSearch} onBack={resetToHome} />;
        case AppView.UnpackResults: return renderUnpackResults();
        case AppView.Contact: return <ContactView onBack={resetToHome} />;
        default: return renderHome();
    }
  }

  return (
    <div className="text-white min-h-screen font-sans pb-20">
      <Header
        currentView={currentView}
        onShowHome={resetToHome}
        onShowPersonas={() => setCurrentView(AppView.PersonaGallery)}
        onShowUnpack={() => setCurrentView(AppView.UnpackHome)}
        onShowContact={() => setCurrentView(AppView.Contact)}
      />
      {renderContent()}
      {chatModalCareer && chatSession && (
        <ChatModal 
            career={chatModalCareer}
            chatSession={chatSession}
            onClose={handleCloseSession}
            onGenerateReport={handleGenerateReportRequest}
            isReportVisible={isReportVisible}
            hasReportData={!!reportData}
            onShowReport={handleShowReport}
        />
      )}
      {isReportVisible && (
        <ReportModal
          isLoading={isGeneratingReport}
          report={reportData}
          error={reportError}
          progress={reportGenerationProgress}
          loadingMessage={reportGenerationMessage}
          onClose={handleCloseSession}
          isFullScreen={isReportFullScreen}
          onToggleFullScreen={handleToggleReportFullScreen}
          onBackToChat={handleBackToChat}
        />
      )}
    </div>
  );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-lime/50 ${
        isActive ? 'bg-brand-lime text-brand-dark' : 'text-white hover:bg-white/10'
        }`}
    >
        {label}
    </button>
);

interface FeatureStatProps {
    title: string;
    description: string;
}
const FeatureStat: React.FC<FeatureStatProps> = ({ title, description }) => (
    <div className="text-center">
        <h3 className="text-3xl font-bold text-brand-lime">{title}</h3>
        <p className="mt-1 text-brand-light-gray">{description}</p>
    </div>
);


export default App;