import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  who: string;
  visible: boolean;
}

export function TypingIndicator({ who, visible }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ overflow: 'hidden' }}
          className="sim-typing"
        >
          <div className="sim-typing-dot" />
          <div className="sim-typing-dot" />
          <div className="sim-typing-dot" />
          <span style={{ marginLeft: 4 }}>{who} 正在输入...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
