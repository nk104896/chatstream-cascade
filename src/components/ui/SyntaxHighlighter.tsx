
import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  showLineNumbers = true,
  className,
  maxHeight = '400px',
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Map common language shortcuts to Prism-supported languages
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    bash: 'bash',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    sql: 'sql',
  };

  // Normalize language name
  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();

  // Make sure Prism recognizes the language, fallback to markup (HTML)
  const prismLanguage = Prism.languages[normalizedLanguage] ? normalizedLanguage : 'markup';

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Code has been copied to your clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Failed to copy code to clipboard",
        });
      }
    );
  };

  return (
    <div className={cn(
      "relative group rounded-md overflow-hidden bg-slate-950 text-slate-50",
      className
    )}>
      {/* Language label */}
      <div className="bg-slate-800 text-slate-200 text-xs px-3 py-1 flex justify-between items-center">
        <span className="font-mono">{language}</span>
        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="text-slate-400 hover:text-white transition-colors ml-2 p-1 rounded"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Code block */}
      <div 
        className={cn(
          "overflow-auto p-4 text-sm font-mono",
          showLineNumbers && "pl-12 relative"
        )}
        style={{ maxHeight }}
      >
        {/* If line numbers are enabled, render them */}
        {showLineNumbers && (
          <div className="absolute left-0 top-0 pt-4 pb-4 text-right text-slate-500 select-none w-8">
            {code.split('\n').map((_, i) => (
              <div key={i} className="pr-2">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        
        {/* The highlighted code */}
        <pre className="overflow-visible">
          <code
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage),
            }}
          />
        </pre>
      </div>
    </div>
  );
};

export default SyntaxHighlighter;
