import React, { useState } from 'react';
import { BackArrowIcon } from './Icon';

interface SignInViewProps {
  onSignIn: () => void;
  onBack: () => void;
}

const SignInView: React.FC<SignInViewProps> = ({ onSignIn, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    if (email && password) {
      onSignIn();
    }
  };
  
  const toggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
  };

  return (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
      <div className="text-sm text-brand-light-gray mb-4">
        <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
        <span className="mx-2">&gt;</span>
        <span className="text-white">{isSignUp ? 'Sign Up' : 'Sign In'}</span>
      </div>
      
      <div className="flex justify-center items-center pt-8">
        <div className="w-full max-w-md bg-brand-gray border border-white/10 rounded-2xl p-8 sm:p-10 relative">
          <button 
            onClick={onBack} 
            className="absolute top-6 left-6 text-brand-light-gray hover:text-white transition-colors"
            aria-label="Go back"
          >
            <BackArrowIcon className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mt-8">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-brand-light-gray mt-2">{isSignUp ? 'Get started on your career journey.' : 'Sign in to continue your journey.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-light-gray mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-black/20 rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-brand-light-gray">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                // FIX: Corrected typo from `e.targe` to `e.target` and completed the handler.
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-black/20 rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-brand-lime text-brand-dark font-semibold rounded-xl hover:bg-brand-lime-dark transition-colors"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-light-gray">
            {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
            <button onClick={toggleView} className="font-semibold text-brand-lime hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

// FIX: Added default export to resolve the module import error in App.tsx.
export default SignInView;