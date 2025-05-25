
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, LogOut, Settings, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import MessageBubble from './MessageBubble';
import FileUpload from './FileUpload';
import TypingIndicator from './TypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  files?: File[];
}

const ChatInterface = () => {
  const { user, profile, isApproved, isAdmin, signOut } = useAuth();
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    if (!isApproved && !isAdmin) {
      alert('Your account is pending admin approval. Please wait for approval to use the AI.');
      return;
    }

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

    // Call AI API (OpenAI integration would go here)
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

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Account Pending Approval</h2>
          <p className="text-gray-300 mb-6">
            Your account is waiting for admin approval. You'll be able to access Penguin AI once an administrator approves your account.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Logged in as: {profile?.email}
          </p>
          <Button onClick={handleSignOut} variant="outline" className="text-white border-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Penguin AI</h1>
              <p className="text-sm text-gray-300">Coding • Math • Reasoning • Multi-modal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Welcome, {profile?.full_name || profile?.email}</span>
            {isAdmin && (
              <Button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Panel Toggle */}
      {isAdmin && showAdminPanel && (
        <div className="bg-orange-500/20 border-b border-orange-300/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-orange-200">Admin Panel Active</span>
            </div>
            <Button
              onClick={() => window.open('/admin', '_blank')}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Open Admin Panel
            </Button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex items-start space-x-3 animate-fade-in",
              message.type === 'user' ? "justify-end flex-row-reverse space-x-reverse" : "justify-start"
            )}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.type === 'user' 
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500" 
                  : "bg-gradient-to-r from-orange-500 to-yellow-500"
              )}>
                {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
              </div>

              {/* Message Content */}
              <div className={cn(
                "max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02]",
                message.type === 'user'
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-300/30 text-white rounded-br-sm"
                  : "bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-300/20 text-white rounded-bl-sm"
              )}>
                {/* File attachments */}
                {message.files && message.files.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {message.files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                        <Image className="w-4 h-4 text-blue-300" />
                        <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message text */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {/* Timestamp */}
                <div className={cn(
                  "mt-2 text-xs opacity-60",
                  message.type === 'user' ? "text-gray-200" : "text-gray-300"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
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
              disabled={isTyping || (!isApproved && !isAdmin)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => setShowFileUpload(true)}
              disabled={!isApproved && !isAdmin}
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
              disabled={!isApproved && !isAdmin}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              disabled={!isApproved && !isAdmin}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping || (!isApproved && !isAdmin)}
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
