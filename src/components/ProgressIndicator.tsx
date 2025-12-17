import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "complete";
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
}

const ProgressIndicator = ({ steps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              step.status === "complete"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : step.status === "active"
                ? "bg-primary/20 text-primary border border-primary/30 animate-pulse-glow"
                : "bg-muted/50 text-muted-foreground border border-border"
            }`}
          >
            {step.status === "complete" ? (
              <Check className="w-3 h-3" />
            ) : step.status === "active" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            )}
            {step.label}
          </motion.div>
          
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`w-8 h-0.5 mx-1 ${
                step.status === "complete" ? "bg-emerald-500/50" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;
