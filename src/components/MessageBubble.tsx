
import React from 'react';
import { Zap, User, Code, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  files?: File[];
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';

  return (
    <div className={cn(
      "flex items-start space-x-3 animate-fade-in",
      isUser ? "justify-end flex-row-reverse space-x-reverse" : "justify-start"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-gradient-to-r from-blue-500 to-cyan-500" 
          : "bg-gradient-to-r from-orange-500 to-yellow-500"
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
      </div>

      {/* Message Content */}
      <div className={cn(
        "max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02]",
        isUser
          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-300/30 text-white rounded-br-sm"
          : "bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-300/20 text-white rounded-bl-sm"
      )}>
        {/* File attachments */}
        {message.files && message.files.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.files.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-blue-300" />
                ) : file.type.includes('text') || file.name.endsWith('.txt') ? (
                  <FileText className="w-4 h-4 text-green-300" />
                ) : (
                  <Code className="w-4 h-4 text-yellow-300" />
                )}
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
          isUser ? "text-gray-200" : "text-gray-300"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
