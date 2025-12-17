import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, RotateCcw, Zap, Globe, Code2, Palette, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AIAgent from "@/components/AIAgent";
import DiscussionMessage from "@/components/DiscussionMessage";
import CodePreview from "@/components/CodePreview";
import ProgressIndicator from "@/components/ProgressIndicator";
import BackgroundEffects from "@/components/BackgroundEffects";
import FileUpload from "@/components/FileUpload";
import { useWebsiteGenerator } from "@/hooks/useWebsiteGenerator";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
  type: "image" | "video" | "other";
}

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const {
    isGenerating,
    currentPhase,
    messages,
    generatedCode,
    error,
    generateWebsite,
    reset,
    agents,
  } = useWebsiteGenerator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description for your website");
      return;
    }
    
    // Create reference descriptions from uploaded files
    const referenceDescriptions = uploadedFiles.map((f) => 
      `Reference file: ${f.file.name} (${f.type})`
    );
    
    await generateWebsite(prompt, referenceDescriptions);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Website downloaded! Open the HTML file in any browser.");
  };

  const handleOpenInNewTab = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const progressSteps = [
    { label: "Analyzing", status: currentPhase === "discussing" ? "active" : currentPhase === "idle" ? "pending" : "complete" },
    { label: "Discussing", status: currentPhase === "discussing" ? "active" : currentPhase === "idle" ? "pending" : "complete" },
    { label: "Coding", status: currentPhase === "coding" ? "active" : currentPhase === "complete" ? "complete" : "pending" },
    { label: "Optimizing", status: currentPhase === "complete" ? "complete" : "pending" },
  ] as const;

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundEffects />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Multi-Agent Website Builder</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">SynthWeb</span>
            <span className="text-foreground"> Studio</span>
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            5 specialized agents collaborate to architect, design, and code your perfect website.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { icon: Globe, label: "Professional Websites" },
              { icon: Palette, label: "Custom Design" },
              { icon: Code2, label: "Clean Code" },
              { icon: Zap, label: "Instant Generation" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground"
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            ))}
          </div>
        </motion.header>

        {/* AI Agents Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 md:gap-10 mb-8 flex-wrap"
        >
          {agents.map((agent, index) => (
            <AIAgent
              key={agent.name}
              name={agent.name}
              color={agent.color}
              isActive={currentPhase !== "idle"}
              isThinking={isGenerating}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {currentPhase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <ProgressIndicator steps={progressSteps as any} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input & Discussion Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Prompt Input */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Describe Your Website
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a modern SaaS landing page for a project management tool with pricing section, testimonials, and a contact form..."
                  className="min-h-32 bg-muted/30 border-border/50 focus:border-primary/50 resize-none"
                  disabled={isGenerating}
                />
                
                {/* File Upload */}
                <FileUpload 
                  onFilesChange={setUploadedFiles}
                  disabled={isGenerating}
                />
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Generate Website
                      </>
                    )}
                  </Button>
                  
                  {currentPhase !== "idle" && (
                    <Button
                      type="button"
                      variant="glass"
                      size="lg"
                      onClick={reset}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Discussion Panel */}
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-strong rounded-2xl p-6"
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-secondary" />
                    Agent Discussion
                  </h2>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {messages.map((msg, index) => (
                      <DiscussionMessage
                        key={index}
                        agent={msg.agent}
                        message={msg.message}
                        color={msg.color}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Code Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <div className="glass-strong rounded-2xl p-6 h-full min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Generated Website
                </h2>
                
                {generatedCode && (
                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              
              {generatedCode ? (
                <div className="flex-1">
                  <CodePreview code={generatedCode} language="html" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Your generated website will appear here</p>
                    <p className="text-xs mt-2 opacity-70">Preview & Code tabs available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>Powered by Multi-Agent Collaboration • 5 Specialized Models Working Together</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
