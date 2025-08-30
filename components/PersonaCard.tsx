import React from 'react';
import type { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onClick }) => {
  const Icon = persona.icon;
  return (
    <button
      onClick={onClick}
      className="group bg-brand-gray border border-white/10 rounded-2xl p-6 flex flex-col text-center items-center cursor-pointer transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 w-full h-full"
    >
      <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center border border-white/10 group-hover:border-brand-lime transition-colors">
        <Icon className="w-8 h-8 text-brand-lime" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">{persona.title}</h3>
      <p className="mt-2 text-sm text-brand-light-gray flex-grow">{persona.tagline}</p>
      <div className="mt-6 w-full py-2 bg-white/5 text-white/80 font-semibold rounded-lg group-hover:bg-brand-lime group-hover:text-brand-dark transition-colors">
        Explore Problems
      </div>
    </button>
  );
};

export default PersonaCard;