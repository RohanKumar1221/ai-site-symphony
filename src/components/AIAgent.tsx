import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface AIAgentProps {
  name: string;
  color: string;
  isActive: boolean;
  isThinking: boolean;
  delay?: number;
}

const AIAgent = ({ name, color, isActive, isThinking, delay = 0 }: AIAgentProps) => {
  const colorClasses: Record<string, string> = {
    cyan: "from-cyan-400 to-cyan-600 shadow-cyan-500/50",
    purple: "from-purple-400 to-purple-600 shadow-purple-500/50",
    pink: "from-pink-400 to-pink-600 shadow-pink-500/50",
    orange: "from-orange-400 to-orange-600 shadow-orange-500/50",
    green: "from-emerald-400 to-emerald-600 shadow-emerald-500/50",
  };

  const borderColors: Record<string, string> = {
    cyan: "border-cyan-500/50",
    purple: "border-purple-500/50",
    pink: "border-pink-500/50",
    orange: "border-orange-500/50",
    green: "border-emerald-500/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        animate={isThinking ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={`relative p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} ${
          isActive ? "shadow-lg" : "opacity-50"
        } transition-all duration-300`}
      >
        <Bot className="w-8 h-8 text-background" />
        
        {isThinking && (
          <motion.div
            className={`absolute -inset-1 rounded-2xl border-2 ${borderColors[color]}`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>
      
      <span className="text-xs font-medium text-muted-foreground">{name}</span>
      
      {isThinking && (
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]}`}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIAgent;
