import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/aiplatform-beta';
import type { Career, ChatMessage, PersonalizationData } from '../types';
import { XIcon, BriefcaseIcon, PaperAirplaneIcon, PlanetIcon, PlusIcon, BackArrowIcon } from './Icon';

declare var marked: { parse: (markdown: string, options?: object) => string };
declare var DOMPurify: { sanitize: (html: string) => string };

interface ChatModalProps {
  career: Career;
  chatSession: Chat;
  onClose: () => void;
  onGenerateReport: (career: Career, personalizationData: PersonalizationData) => void;
  isReportVisible: boolean;
  hasReportData: boolean;
  onShowReport: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ career, chatSession, onClose, onGenerateReport, isReportVisible, hasReportData, onShowReport }) => {
  const [view, setView] = useState<'chat' | 'personalization'>('chat');
  
  // Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Personalization Form State
  const [age, setAge] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [isOpenToAbroad, setIsOpenToAbroad] = useState<boolean>(true);
  const [showAstrology, setShowAstrology] = useState<boolean>(false);
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [timeOfBirth, setTimeOfBirth] = useState<string>('');
  const [placeOfBirth, setPlaceOfBirth] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: `Let's talk about being a ${career.title}. What's on your mind? You can ask me anything or choose a preset question below.`,
      },
    ]);
  }, [career]);

  useEffect(() => {
    // Scroll to bottom of chat history when new messages are added
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);


  const presetQuestions = [
    "What's a typical day like?",
    "What are the pros and cons?",
    "What is the average salary?",
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isResponding) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsResponding(true);

    try {
      const stream = await chatSession.sendMessageStream({ message: messageToSend });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]); 

      for await (const chunk of stream) {
          modelResponse += chunk.text;
          setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = modelResponse;
              return newMessages;
          });
      }
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1].role === 'model') {
                newMessages[newMessages.length - 1].content = "Sorry, I encountered an error. Please try again.";
            } else {
                newMessages.push({ role: 'model', content: "Sorry, I encountered an error. Please try again." });
            }
            return newMessages;
        });
    } finally {
        setIsResponding(false);
    }
  };
  
  const handleGenerateReportSubmit = () => {
      if (!age || !country) {
          setFormError("Please fill in your age and country.");
          return;
      }
      setFormError(null);
      
      const personalizationData: PersonalizationData = {
          age: parseInt(age, 10),
          country,
          isOpenToAbroad,
          astrology: showAstrology && dateOfBirth && timeOfBirth && placeOfBirth ? {
              dateOfBirth,
              timeOfBirth,
              placeOfBirth
          } : undefined
      };
      
      onGenerateReport(career, personalizationData);
  };

  const renderChatView = () => (
    <>
      <div ref={chatHistoryRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
            )}
            <div className={`p-4 rounded-xl max-w-lg ${msg.role === 'model' ? 'bg-black/20 text-white' : 'bg-brand-lime text-brand-dark'}`}>
               {msg.role === 'model' ? (
                <div
                  className="chat-prose"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content, { breaks: true, gfm: true })) }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
          {isResponding && (
          <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
              <div className="bg-black/20 p-4 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-light-gray rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-brand-light-gray rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-2 h-2 bg-brand-light-gray rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
              </div>
          </div>
          )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <PresetButton onClick={() => setView('personalization')} disabled={isResponding}>
              Get Full Market Report ✨
            </PresetButton>
            {presetQuestions.map((q) => (
            <PresetButton key={q} onClick={() => setInputMessage(q)} disabled={isResponding}>
              {q}
            </PresetButton>
          ))}
        </div>
        <form className="relative" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isResponding}
            className="w-full pl-4 pr-14 py-3 bg-black/20 rounded-xl text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-2 focus:ring-brand-lime focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isResponding || !inputMessage.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-lime text-brand-dark hover:bg-brand-lime-dark disabled:bg-white/10 disabled:text-brand-light-gray transition-colors"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );

  const renderPersonalizationView = () => (
    <div className="flex-1 p-6 overflow-y-auto">
        <button onClick={() => setView('chat')} className="flex items-center gap-2 text-sm text-brand-light-gray hover:text-white mb-4">
            <BackArrowIcon className="w-4 h-4"/>
            Back to Chat
        </button>
        <h3 className="text-2xl font-bold text-white">Personalize Your Report</h3>
        <p className="text-brand-light-gray mt-2 mb-6">This will help me tailor the salary data, college recommendations, and insights just for you.</p>
        
        <div className="space-y-4">
            <FormInput id="age" label="What is your current age?" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            <FormInput id="country" label="Which country do you currently live in?" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., United States" required />

            <div>
                <label className="block text-sm font-medium text-brand-light-gray mb-2">Are you open to studying or working abroad?</label>
                <div className="flex gap-2">
                    <RadioPill id="abroad-yes" name="abroad" label="Yes, I'm open to international options" checked={isOpenToAbroad} onChange={() => setIsOpenToAbroad(true)} />
                    <RadioPill id="abroad-no" name="abroad" label="No, I prefer my home country" checked={!isOpenToAbroad} onChange={() => setIsOpenToAbroad(false)} />
                </div>
            </div>

            {!showAstrology && (
                <button onClick={() => setShowAstrology(true)} className="flex items-center gap-2 text-sm text-brand-lime hover:underline">
                    <PlusIcon className="w-4 h-4" />
                    Add Personalized Astrological Insight (Optional)
                </button>
            )}

            {showAstrology && (
                <div className="p-4 bg-black/20 rounded-lg space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <PlanetIcon className="w-5 h-5 text-brand-lime" />
                        <h4 className="font-semibold text-white">Astrological Details</h4>
                    </div>
                    <FormInput id="dob" label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    <FormInput id="tob" label="Time of Birth" type="time" value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} />
                    <FormInput id="pob" label="Place of Birth (City, Country)" type="text" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
                </div>
            )}
        </div>
        
        <div className="mt-8">
            {formError && <p className="text-red-400 text-center mb-4">{formError}</p>}
            <button onClick={handleGenerateReportSubmit} className="w-full py-3 bg-brand-lime text-brand-dark font-bold rounded-xl hover:bg-brand-lime-dark transition-colors">
                Generate My Personalized Report
            </button>
        </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center sm:p-4 transition-opacity duration-300 ${isReportVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      <div className={`relative w-full max-w-2xl h-screen sm:h-[80vh] bg-brand-gray border border-white/10 rounded-none sm:rounded-2xl flex flex-col shadow-2xl transition-all duration-300 ${isReportVisible ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-brand-light-gray" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{career.title}</h2>
                <p className="text-sm text-brand-light-gray">{career.summary}</p>
            </div>
          </div>
           <div className="flex items-center gap-2">
                {hasReportData && (
                    <button 
                        onClick={onShowReport} 
                        className="px-4 py-2 text-sm font-semibold bg-brand-dark text-white rounded-full hover:bg-white/10 transition-colors border border-white/10"
                        aria-label="View Generated Report"
                    >
                        View Report
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 text-brand-light-gray hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close chat modal"
                >
                    <XIcon className="w-6 h-6" />
                </button>
           </div>
        </div>

        {view === 'chat' ? renderChatView() : renderPersonalizationView()}
      </div>
    </div>
  );
};

const PresetButton: React.FC<{onClick: () => void, disabled: boolean, children: React.ReactNode}> = ({ onClick, disabled, children }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap bg-black/20 text-brand-light-gray rounded-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
    >
        {children}
    </button>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-light-gray mb-2">{label}</label>
        <input 
            id={id}
            {...props}
            className="w-full p-2 bg-black/20 rounded-lg text-white placeholder-brand-light-gray/50 border border-white/10 focus:ring-1 focus:ring-brand-lime focus:outline-none transition-all"
        />
    </div>
);

interface RadioPillProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const RadioPill: React.FC<RadioPillProps> = ({ label, id, ...props }) => (
    <div>
        <input type="radio" id={id} {...props} className="sr-only peer" />
        <label htmlFor={id} className="block cursor-pointer px-4 py-2 text-sm text-center rounded-lg border border-white/10 bg-black/20 text-brand-light-gray peer-checked:bg-brand-lime peer-checked:text-brand-dark peer-checked:border-brand-lime transition-colors">
            {label}
        </label>
    </div>
);

export default ChatModal;
