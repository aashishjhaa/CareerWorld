import React, { useState } from 'react';
import { SearchIcon } from './Icon';

interface UnpackViewProps {
  onSearch: (objectName: string) => void;
  onBack: () => void;
}

const suggestedItems = [
  { name: 'A Smartphone', emoji: '📱' },
  { name: 'A Video Game', emoji: '🎮' },
  { name: 'An Electric Car', emoji: '🚗' },
  { name: 'A Can of Soda', emoji: '🥤' },
  { name: 'A Book', emoji: '📖' },
  { name: 'A T-Shirt', emoji: '👕' },
];

const UnpackView: React.FC<UnpackViewProps> = ({ onSearch, onBack }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  return (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
      <div className="text-sm text-brand-light-gray mb-10">
        <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
        <span className="mx-2">&gt;</span>
        <span className="text-white">Unpack</span>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">Unpack Your World</h1>
        <p className="mt-4 text-lg text-brand-light-gray">
          What do you see? Type an object to reveal the careers that brought it to life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative mt-8">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g., 'a soda can', 'my laptop', 'a wooden chair'"
          className="w-full pl-6 pr-14 py-4 bg-brand-gray rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all text-base"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-brand-light-gray hover:text-white" aria-label="Search">
          <SearchIcon className="w-6 h-6" />
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mt-12">
        {suggestedItems.map(({ name, emoji }) => (
          <button
            key={name}
            onClick={() => onSearch(name)}
            className="group bg-brand-gray border border-white/10 rounded-xl p-5 text-left flex items-center gap-4 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:-translate-y-1"
          >
            <span className="text-3xl">{emoji}</span>
            <h3 className="text-md font-semibold text-white">{name}</h3>
          </button>
        ))}
      </div>
    </main>
  );
};

export default UnpackView;
