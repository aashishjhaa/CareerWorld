import React from 'react';
import { XIcon } from './Icon';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  credits: number;
  maxCredits: number;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose, onSignUp, credits, maxCredits }) => {
  if (!isOpen) return null;

  const progressPercentage = (credits / maxCredits) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-brand-gray border border-white/10 rounded-2xl flex flex-col items-center text-center shadow-2xl animate-fade-in-up p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-brand-light-gray hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close credits modal"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-white">What are Credits?</h2>
        <p className="mt-4 text-brand-light-gray max-w-xs">
          Each AI-powered action, like a search, chat message, or persona generation, uses one credit.
        </p>
        
        <div className="w-full bg-black/20 rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-light-gray">Credits Remaining</span>
            <span className="text-sm font-bold text-white">
              <span className="text-brand-lime">{credits}</span> / {maxCredits}
            </span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2.5">
            <div
              className="bg-brand-lime h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <p className="mt-6 font-semibold text-white text-lg">
          Get more credits and save your progress!
        </p>

        <button
          onClick={onSignUp}
          className="w-full mt-4 py-3 bg-brand-lime text-brand-dark text-lg font-bold rounded-xl hover:bg-brand-lime-dark transition-colors"
        >
          Sign Up for 30 Credits
        </button>
      </div>
    </div>
  );
};

export default CreditsModal;
