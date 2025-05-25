import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, FileText, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import FileUpload from './FileUpload';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  files?: File[];
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm Penguin AI, your intelligent assistant. I can help you with coding, mathematics, general reasoning, and much more. Feel free to send me text, images, documents, or audio files - I'm here to help!",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      files,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you're asking about " + (content.includes('code') ? 'coding' : content.includes('math') ? 'mathematics' : 'general reasoning') + ". Let me help you with that!",
        "Great question! Based on your input, I can provide detailed assistance. Would you like me to break this down step by step?",
        "I see you've shared some content. Let me analyze this and provide you with a comprehensive response.",
        "Excellent! This is exactly the type of problem I love solving. Here's my detailed analysis...",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  const handleFileUpload = (files: File[]) => {
    handleSendMessage(`Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`, files);
    setShowFileUpload(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Penguin AI</h1>
            <p className="text-sm text-gray-300">Coding • Math • Reasoning • Multi-modal</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20">
            <FileUpload
              onFileUpload={handleFileUpload}
              onClose={() => setShowFileUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything - coding, math, reasoning, or upload files..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-300 pr-12 py-6 text-lg rounded-2xl backdrop-blur-sm"
              disabled={isTyping}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => setShowFileUpload(true)}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setShowFileUpload(true)}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full px-6 py-3"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
