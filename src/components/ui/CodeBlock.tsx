
import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme by default
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-dart';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
  className,
  maxHeight = '500px',
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Detect language if not provided
  const detectLanguage = (code: string): string => {
    // Simple language detection based on common patterns
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('function') || code.includes('=>')) return 'javascript';
    if (code.includes('import React') || code.includes('from "react"')) return 'jsx';
    if (code.includes('class') && code.includes('extends') && code.includes('render()')) return 'jsx';
    if (code.includes('<html') || code.includes('<!DOCTYPE html')) return 'html';
    if (code.includes('public static void main')) return 'java';
    if (code.includes('#include <') && code.includes('int main(')) return 'cpp';
    if (code.includes('package main') && code.includes('func main()')) return 'go';
    if (code.includes('fn main()') && code.includes('let mut')) return 'rust';
    if (code.includes('SELECT') && code.includes('FROM') && code.includes('WHERE')) return 'sql';
    
    // Default fallback
    return language;
  };

  const detectedLanguage = language === 'auto' ? detectLanguage(code) : language;

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, detectedLanguage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard",
        duration: 2000,
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "relative my-4 overflow-hidden rounded-lg bg-muted/50 text-sm shadow-md",
      className
    )}>
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/70 px-4 py-2">
        <div className="text-xs font-medium text-muted-foreground">
          {detectedLanguage}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted focus:outline-none"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      
      <div 
        className={cn(
          "overflow-auto px-4 py-3",
          showLineNumbers && "line-numbers",
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        )}
        style={{ maxHeight }}
      >
        <pre className={cn("m-0", showLineNumbers && "line-numbers")}>
          <code 
            ref={codeRef}
            className={`language-${detectedLanguage}`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
