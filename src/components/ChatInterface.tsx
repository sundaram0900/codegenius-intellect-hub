import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, LogOut, Settings, Zap, User, CornerDownLeft, MessageSquare, Share, Copy, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import FileUpload from './FileUpload';
import TypingIndicator from './TypingIndicator';
import MessageContent from './MessageContent';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  files?: File[];
  replyTo?: string;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
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
      replyTo: replyingTo || undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setReplyingTo(null);
    setIsTyping(true);

    try {
      // Prepare conversation history for the AI
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call the AI edge function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          conversation_history: conversationHistory
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: "Hello! I'm Penguin AI, your intelligent assistant. I can help you with coding, mathematics, general reasoning, and much more. Feel free to send me text, images, documents, or audio files - I'm here to help!",
        timestamp: new Date(),
      }
    ]);
    setReplyingTo(null);
    setShareLink(null);
  };

  const handleShareChat = () => {
    // Generate a unique ID for the chat
    const chatId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const chatData = {
      id: chatId,
      messages: messages,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for demo purposes (in production, you'd save to database)
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
    
    // Generate shareable link
    const shareUrl = `${window.location.origin}/chat/${chatId}`;
    setShareLink(shareUrl);
    
    // Copy to clipboard as backup
    navigator.clipboard.writeText(shareUrl);
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    inputRef.current?.focus();
  };

  const hasCodeBlocks = (content: string) => {
    return content.includes('```');
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
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
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
            <Button
              onClick={handleNewChat}
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              onClick={handleShareChat}
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <Link className="w-4 h-4 mr-2" />
              Share
            </Button>
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

      {/* Share Link Display */}
      {shareLink && (
        <div className="bg-green-500/20 border-b border-green-300/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-green-300" />
              <span className="text-sm text-green-200">Share link created and copied to clipboard:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded">{shareLink}</span>
              <Button
                onClick={() => setShareLink(null)}
                size="sm"
                variant="ghost"
                className="text-green-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Reply indicator */}
      {replyingTo && (
        <div className="bg-blue-500/20 border-b border-blue-300/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CornerDownLeft className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">
                Replying to: {messages.find(m => m.id === replyingTo)?.content.substring(0, 50)}...
              </span>
            </div>
            <Button
              onClick={() => setReplyingTo(null)}
              size="sm"
              variant="ghost"
              className="text-blue-300 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="w-full">
              {/* User messages - completely right side */}
              {message.type === 'user' && (
                <div className="flex justify-end">
                  <div className="flex items-start space-x-3 max-w-[70%]">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300/30 text-white p-4 rounded-2xl rounded-br-sm backdrop-blur-sm">
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-white/10 rounded-lg text-xs opacity-70">
                          Replying to: {messages.find(m => m.id === message.replyTo)?.content.substring(0, 30)}...
                        </div>
                      )}
                      
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

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs opacity-60 text-gray-200">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <Button
                          onClick={() => handleReply(message.id)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-300 hover:text-white h-6 px-2"
                        >
                          <CornerDownLeft className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bot messages - completely left side */}
              {message.type === 'bot' && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[70%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-300/20 text-white p-4 rounded-2xl rounded-bl-sm backdrop-blur-sm">
                      <MessageContent content={message.content} />
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs opacity-60 text-gray-300">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <Button
                          onClick={() => handleReply(message.id)}
                          size="sm"
                          variant="ghost"
                          className="text-orange-300 hover:text-white h-6 px-2"
                        >
                          <CornerDownLeft className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
