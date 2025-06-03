
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900/50 border border-gray-600/30 rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-600/30">
        <span className="text-xs text-gray-400">{language || 'code'}</span>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white h-6 px-2"
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
