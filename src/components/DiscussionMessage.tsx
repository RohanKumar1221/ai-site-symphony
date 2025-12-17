import { motion } from "framer-motion";

interface DiscussionMessageProps {
  agent: string;
  message: string;
  color: string;
  index: number;
}

const DiscussionMessage = ({ agent, message, color, index }: DiscussionMessageProps) => {
  const colorClasses: Record<string, string> = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    pink: "border-pink-500/30 bg-pink-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    green: "border-emerald-500/30 bg-emerald-500/5",
  };

  const textColors: Record<string, string> = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    orange: "text-orange-400",
    green: "text-emerald-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`p-4 rounded-lg border ${colorClasses[color]} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600`} 
             style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
        <span className={`text-sm font-semibold ${textColors[color]}`}>{agent}</span>
      </div>
      <p className="text-sm text-muted-foreground font-mono leading-relaxed">{message}</p>
    </motion.div>
  );
};

export default DiscussionMessage;
