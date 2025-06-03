
import React from 'react';
import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
}

const MessageContent = ({ content }: MessageContentProps) => {
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return (
    <div>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // This is a code block
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          
          return (
            <CodeBlock key={index} code={code} language={language} />
          );
        } else {
          // This is regular text
          return part ? (
            <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
              {part}
            </p>
          ) : null;
        }
      })}
    </div>
  );
};

export default MessageContent;
