import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Persona } from '../types';
import { SearchIcon, PlusIcon } from './Icon';

const CreatePersonaCard: React.FC<{ text: string; onClick: () => void; isGenerating: boolean; }> = ({ text, onClick, isGenerating }) => (
    <button
        onClick={onClick}
        disabled={isGenerating}
        className="group w-full h-full flex flex-col items-center justify-center bg-brand-gray/50 rounded-2xl border-2 border-dashed border-white/20 transition-all duration-300 hover:border-brand-lime hover:bg-brand-gray disabled:opacity-50 disabled:cursor-not-allowed p-6 text-center focus:outline-none focus:ring-2 focus:ring-brand-lime"
        aria-label={`Create custom persona: ${text}`}
    >
        {isGenerating ? (
            <div className="w-10 h-10 border-4 border-brand-light-gray/20 border-t-brand-lime rounded-full animate-spin"></div>
        ) : (
            <PlusIcon className="w-10 h-10 text-brand-light-gray group-hover:text-brand-lime transition-colors" />
        )}
        <p className="mt-6 text-xl font-bold text-white">Create Persona</p>
        <p className="mt-2 text-sm text-brand-lime line-clamp-3">"{text}"</p>
    </button>
);

const PersonaGalleryCard: React.FC<{ persona: Persona; onClick: () => void; }> = ({ persona, onClick }) => (
    <button
      onClick={onClick}
      className="group w-full h-full flex flex-col bg-brand-gray rounded-2xl border border-white/10 transition-all duration-300 hover:border-brand-lime hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-lime overflow-hidden"
      aria-label={`Select persona: ${persona.title}`}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={persona.image}
          alt={persona.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-6 text-left flex flex-col flex-grow">
        <h3 className="text-xl font-bold transition-colors duration-300 text-white group-hover:text-brand-lime">{persona.title}</h3>
        <p className="mt-2 text-sm text-brand-light-gray line-clamp-2">{persona.tagline}</p>
        <div className="flex-grow" />
        <p className="mt-2 text-xs text-brand-light-gray/80">{persona.description}</p>
      </div>
    </button>
);


interface PersonaViewProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  onBack: () => void;
  onGeneratePersona: (prompt: string) => void;
  isGenerating: boolean;
  generationError: string | null;
}

const PersonaView: React.FC<PersonaViewProps> = ({ personas, onSelectPersona, onBack, onGeneratePersona, isGenerating, generationError }) => {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const placeholderRef = useRef<HTMLSpanElement>(null);

  const placeholders = useMemo(() => [
    "Try: 'a first-time homeowner'",
    "'an aspiring musician'",
    "'a small cafe owner'",
    "or describe your own...",
  ], []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
        if (placeholderRef.current) {
            placeholderRef.current.style.opacity = '0';
            setTimeout(() => {
                index = (index + 1) % placeholders.length;
                if(placeholderRef.current) {
                    placeholderRef.current.textContent = placeholders[index];
                    placeholderRef.current.style.opacity = '1';
                }
            }, 300);
        }
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);
  
  useEffect(() => {
    setLocalError(generationError);
  }, [generationError]);

  const filteredPersonas = useMemo(() => {
    if (!inputValue.trim()) {
      return personas;
    }
    const searchTerm = inputValue.toLowerCase();
    return personas.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.tagline.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }, [personas, inputValue]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if(localError) setLocalError(null);
  }

  const handleGenerateSubmit = () => {
    if (inputValue.trim() && !isGenerating) {
      onGeneratePersona(inputValue);
    }
  };

  return (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
        <div className="text-sm text-brand-light-gray mb-10">
            <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
            <span className="mx-2">&gt;</span>
            <span className="text-white">Personas</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">Solve for Someone.</h1>
            <p className="mt-4 text-lg text-brand-light-gray">
                Understand their world to find your career. Filter our gallery, or describe a new persona to generate it with AI.
            </p>
        </div>
        
        <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-light-gray/50" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full pl-12 pr-4 py-4 bg-brand-gray rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all text-base ${localError ? 'ring-2 ring-red-500' : ''}`}
                    disabled={isGenerating}
                />
                 {!inputValue && (
                    <span ref={placeholderRef} className="absolute left-12 top-1/2 -translate-y-1/2 text-brand-light-gray/50 transition-opacity duration-300 pointer-events-none">
                        {placeholders[0]}
                    </span>
                 )}
            </div>
            {localError && <p className="mt-2 text-red-400 text-center">{localError}</p>}
        </div>

        <div className="mt-12">
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {inputValue.trim() && (
                    <div className="animate-fade-in h-full">
                        <CreatePersonaCard text={inputValue} onClick={handleGenerateSubmit} isGenerating={isGenerating} />
                    </div>
                )}
                {filteredPersonas.map((persona, index) => (
                    <div 
                        key={persona.title} 
                        className="animate-fade-in-up" 
                        style={{ animationDelay: `${(inputValue.trim() ? 1 : 0 + index) * 50}ms` }}
                    >
                        <PersonaGalleryCard 
                            persona={persona} 
                            onClick={() => onSelectPersona(persona)}
                        />
                    </div>
                ))}
            </div>
        </div>
        
    </main>
  );
};

export default PersonaView;