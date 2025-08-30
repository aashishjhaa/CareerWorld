import React from 'react';
import { EmailIcon, TwitterXIcon, InstagramIcon, GitHubIcon } from './Icon';

interface ContactViewProps {
  onBack: () => void;
}

const contactLinks = [
  {
    icon: EmailIcon,
    title: 'Email',
    handle: 'aashsih.jha360@gmail.com',
    href: 'mailto:aashsih.jha360@gmail.com',
  },
  {
    icon: TwitterXIcon,
    title: 'X (Twitter)',
    handle: '@aashishjha__',
    href: 'https://twitter.com/aashishjha__',
  },
  {
    icon: InstagramIcon,
    title: 'Instagram',
    handle: '@aashishjha__',
    href: 'https://instagram.com/aashishjha__',
  },
  {
    icon: GitHubIcon,
    title: 'GitHub',
    handle: '@aashishjhaa',
    href: 'https://github.com/aashishjhaa',
  },
];

const ContactView: React.FC<ContactViewProps> = ({ onBack }) => {
  return (
    <main className="container mx-auto px-4 pt-28 animate-fade-in">
        <div className="text-sm text-brand-light-gray mb-10">
            <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
            <span className="mx-2">&gt;</span>
            <span className="text-white">Contact Us</span>
        </div>

        <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Contact Us</h1>
            <p className="mt-4 text-lg text-brand-light-gray">
                Have questions, feedback, or just want to connect? Reach out through any of these channels.
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            {contactLinks.map((link) => (
                <ContactCard key={link.title} {...link} />
            ))}
        </div>
    </main>
  );
};

interface ContactCardProps {
    icon: React.FC<{ className?: string }>;
    title: string;
    handle: string;
    href: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, handle, href }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-center gap-5 p-6 bg-brand-gray border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-lime"
    >
        <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-brand-lime transition-transform group-hover:scale-110" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm text-brand-light-gray">{handle}</p>
        </div>
    </a>
);

export default ContactView;