import { motion } from 'framer-motion';

const AIModels = () => {
  return (
    <div className="min-h-screen w-full bg-[#111111] flex flex-col items-center justify-start p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        {/* Feature Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-zinc-900 to-black rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-zinc-800/30"
        >
          {/* Card Header */}
          <div className="relative p-5 md:p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/30 to-zinc-900/50" />
            <div className="relative flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20"
              >
                <span className="material-symbols-rounded text-3xl text-purple-400">psychology</span>
              </motion.div>
              <div>
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent"
                >
                  Feature Launching Soon
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-400 text-sm mt-1"
                >
                  Advanced AI-powered content generation and optimization
                </motion.p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-5 md:p-6 space-y-5">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: 'neurology', title: 'Smart Generation', desc: 'Context-aware content creation', color: 'text-purple-400' },
                { icon: 'bolt', title: 'Quick Optimization', desc: 'Real-time content enhancement', color: 'text-amber-400' },
                { icon: 'monitoring', title: 'Analytics', desc: 'Performance tracking & insights', color: 'text-blue-400' },
                { icon: 'track_changes', title: 'Targeting', desc: 'Audience-specific optimization', color: 'text-emerald-400' }
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/20 border border-zinc-700/30 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <span className={`material-symbols-rounded ${feature.color}`}>{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 text-sm">{feature.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Technology Stack */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/50">
              <h3 className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-rounded text-purple-400">memory</span>
                Powered By
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Neural Networks', icon: 'neurology', color: 'text-purple-400' },
                  { name: 'Machine Learning', icon: 'smart_toy', color: 'text-blue-400' },
                  { name: 'Smart Algorithms', icon: 'code', color: 'text-emerald-400' },
                  { name: 'Fast Processing', icon: 'speed', color: 'text-amber-400' }
                ].map((tech) => (
                  <motion.div
                    key={tech.name}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className={`material-symbols-rounded ${tech.color}`}>{tech.icon}</span>
                    <span className="text-xs text-zinc-400">{tech.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-rounded text-amber-400">trending_up</span>
                  Development Progress
                </span>
                <span className="text-xs font-mono text-zinc-500">85%</span>
              </div>
              <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ delay: 0.7, duration: 1.5 }}
                  className="h-full bg-gradient-to-r from-purple-500/50 via-blue-400/50 to-emerald-300/50 rounded-full"
                />
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-3 border-t border-zinc-800/50"
            >
              <p className="text-zinc-500 text-xs flex items-center justify-center gap-2">
                <span className="material-symbols-rounded text-amber-400">stars</span>
                The future of AI-driven content is almost here!
                <span className="material-symbols-rounded text-amber-400">stars</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Add CSS for grid pattern
const style = document.createElement('style');
style.textContent = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }
`;
document.head.appendChild(style);

export default AIModels; 