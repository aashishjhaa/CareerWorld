import React, { useState } from 'react';
import { LogoIcon, MenuIcon, XIcon } from './Icon';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onShowHome: () => void;
  onShowPersonas: () => void;
  onShowUnpack: () => void;
  onShowContact: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onShowHome, onShowPersonas, onShowUnpack, onShowContact }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomeActive = [AppView.Home, AppView.Results].includes(currentView);
  const isPersonaActive = [AppView.PersonaGallery, AppView.ProblemExplorer].includes(currentView);
  const isUnpackActive = [AppView.UnpackHome, AppView.UnpackResults].includes(currentView);
  const isContactActive = currentView === AppView.Contact;

  const handleMobileLinkClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/50 backdrop-blur-lg border-b border-white/10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button onClick={onShowHome} className="flex items-center gap-2 text-white text-xl font-bold">
                <LogoIcon className="h-8 w-8 text-brand-lime" />
                <span>CareerWorld</span>
              </button>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2 bg-black/20 p-1 rounded-full">
              <NavLink onClick={onShowHome} isActive={isHomeActive}>Home</NavLink>
              <NavLink onClick={onShowPersonas} isActive={isPersonaActive}>Persona</NavLink>
              <NavLink onClick={onShowUnpack} isActive={isUnpackActive}>Unpack</NavLink>
              <NavLink onClick={onShowContact} isActive={isContactActive}>Contact Us</NavLink>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-brand-light-gray hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-lime"
                aria-label="Open main menu"
              >
                <span className="sr-only">Open main menu</span>
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"></div>
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-brand-gray shadow-xl animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-brand-light-gray hover:text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <span className="sr-only">Close menu</span>
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            {/* Links */}
            <nav className="p-4 space-y-2">
              <MobileNavLink onClick={() => handleMobileLinkClick(onShowHome)} isActive={isHomeActive}>Home</MobileNavLink>
              <MobileNavLink onClick={() => handleMobileLinkClick(onShowPersonas)} isActive={isPersonaActive}>Persona</MobileNavLink>
              <MobileNavLink onClick={() => handleMobileLinkClick(onShowUnpack)} isActive={isUnpackActive}>Unpack</MobileNavLink>
              <MobileNavLink onClick={() => handleMobileLinkClick(onShowContact)} isActive={isContactActive}>Contact Us</MobileNavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

interface NavLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ onClick, children, isActive }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-gray text-white'
        : 'text-brand-light-gray hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
);

interface MobileNavLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ onClick, children, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
      isActive
        ? 'bg-brand-lime text-brand-dark'
        : 'text-brand-light-gray hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default Header;