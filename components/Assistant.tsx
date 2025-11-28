import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { createChatSession, sendMessageToGeminiStream } from '../services/gemini';
import { ChatMessage, MessageRole } from '../types';
import Icon from './Icon';

interface AssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      text: "你好！我是科技刘。今天有什么可以在代码或导航方面帮你的吗？"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: MessageRole.USER,
      text: inputValue
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    // Add placeholder for streaming response
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: MessageRole.MODEL,
      text: '',
      isStreaming: true
    }]);

    try {
      const stream = await sendMessageToGeminiStream(chatSessionRef.current, newUserMsg.text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: fullText }
            : msg
        ));
      }
      
      // Finalize message
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: MessageRole.MODEL,
        text: "**错误：** 无法连接到 AI。请检查您的 API 配置。"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
        <div className="flex items-center gap-2 text-violet-400">
          <Icon name="Sparkles" size={20} />
          <h2 className="font-semibold text-lg text-white">科技刘助手</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === MessageRole.USER 
                  ? 'bg-violet-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'}
              `}
            >
              {msg.role === MessageRole.MODEL ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
              {msg.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-violet-400 animate-pulse align-middle" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        <div className="relative flex items-end gap-2 bg-slate-800/50 border border-white/10 rounded-xl p-2 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问点什么..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm resize-none focus:outline-none py-2 px-2 h-auto max-h-32 min-h-[40px]"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex-shrink-0"
          >
            {isLoading ? <Icon name="Loader2" className="animate-spin" size={18} /> : <Icon name="Send" size={18} />}
          </button>
        </div>
        <div className="text-xs text-slate-500 mt-2 text-center">
          由 Gemini 2.5 Flash 驱动。AI 可能会犯错。
        </div>
      </div>
    </div>
  );
};

export default Assistant;