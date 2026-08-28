import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/api';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  X,
  ChevronDown,
  HelpCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

const PatientAIChat = ({ activeClaim = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your ClaimsCare AI Assistant. How can I help you with your claim status or medical documentation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    const userMessage = {
      sender: 'user',
      text: msg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.patientAssistantChat(msg.trim(), activeClaim?._id);
      const assistantMessage = {
        sender: 'assistant',
        text: res.data?.reply || 'I am processing your claim details. Please check back shortly.',
        suggestions: res.data?.suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not retrieve your claim update at this moment. Please verify your connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['Manrope',sans-serif]">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#006d77] hover:bg-[#00535b] text-white rounded-full shadow-[0px_8px_24px_rgba(0,109,119,0.35)] transition-all transform hover:scale-105 active:scale-95 text-xs font-bold"
        >
          <Sparkles className="w-4 h-4 text-teal-200 animate-pulse" />
          <span>Ask ClaimsCare AI</span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl border border-[#e0e3e5] shadow-[0px_16px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#006d77] text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">ClaimsCare Patient AI</h3>
                <p className="text-[10px] text-teal-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Grounded in your policy benefits
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Badge if claim is selected */}
          {activeClaim && (
            <div className="bg-[#f0f4f4] px-4 py-2 border-b border-[#e0e3e5] flex items-center justify-between text-xs text-[#006d77]">
              <span className="font-semibold truncate">
                Claim: ${activeClaim.claimAmount} ({activeClaim.status})
              </span>
              <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                {activeClaim.hospitalName || 'Medical'}
              </span>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#f7f9fb]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#006d77] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-[#006d77] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-[#e0e3e5] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      m.sender === 'user' ? 'text-teal-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-500">
                <div className="w-7 h-7 rounded-full bg-[#006d77] text-white flex items-center justify-center text-xs animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#006d77] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#006d77] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#006d77] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-[#e0e3e5] flex gap-1.5 overflow-x-auto no-scrollbar">
            {['Check claim status', 'Are any documents missing?', 'Explain reimbursement'].map(
              (prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="flex-shrink-0 text-[10px] font-semibold bg-[#f0f4f4] hover:bg-[#e0e8e8] text-[#006d77] px-2.5 py-1 rounded-full transition-all border border-slate-200"
                >
                  {prompt}
                </button>
              )
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#e0e3e5] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your claim or policy..."
              className="flex-1 text-xs px-3.5 py-2 bg-[#f8fafc] border border-[#e0e3e5] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-[#006d77] hover:bg-[#00535b] disabled:opacity-40 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientAIChat;
