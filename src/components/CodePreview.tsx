import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Code2, Eye } from "lucide-react";
import { Button } from "./ui/button";

interface CodePreviewProps {
  code: string;
  language: string;
}

const CodePreview = ({ code, language }: CodePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden border border-border bg-card/50 backdrop-blur-xl h-full flex flex-col"
    >
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === "code" && (
            <>
              <span className="text-xs text-muted-foreground font-mono">{language}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopy}
                className="h-7 px-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
          {activeTab === "preview" && (
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-orange-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "preview" ? (
          <iframe
            srcDoc={code}
            title="Website Preview"
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <pre className="p-4 overflow-auto h-full max-h-[500px]">
            <code className="text-sm font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {code}
            </code>
          </pre>
        )}
      </div>
    </motion.div>
  );
};

export default CodePreview;
