import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
      {/* Deep Gold Orb */}
      <motion.div
        initial={{ x: '-20%', y: '10%' }}
        animate={{
          x: ['-20%', '120%', '-20%'],
          y: ['10%', '40%', '10%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute w-[600px] h-[600px] rounded-full bg-[#c9a84c] opacity-[0.04] blur-[180px] will-change-transform"
      />

      {/* Dark Navy Orb */}
      <motion.div
        initial={{ x: '100%', y: '60%' }}
        animate={{
          x: ['100%', '-20%', '100%'],
          y: ['60%', '20%', '60%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute w-[700px] h-[700px] rounded-full bg-[#1a1a2e] opacity-[0.07] blur-[200px] will-change-transform"
      />

      {/* Secondary Gold Orb */}
      <motion.div
        initial={{ x: '50%', y: '-20%' }}
        animate={{
          x: ['50%', '20%', '80%', '50%'],
          y: ['-20%', '80%', '20%', '-20%'],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[#c9a84c] opacity-[0.03] blur-[160px] will-change-transform"
      />

      {/* Gold Dust Particles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[
          { top: '20%', left: '10%', delay: 0 },
          { top: '40%', left: '80%', delay: 2 },
          { top: '70%', left: '30%', delay: 4 },
          { top: '10%', left: '60%', delay: 1 },
          { top: '80%', left: '90%', delay: 3 },
          { top: '50%', left: '50%', delay: 5 },
          { top: '30%', left: '20%', delay: 2.5 },
          { top: '60%', left: '70%', delay: 1.5 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: pos.top,
              left: pos.left,
              opacity: 0.5,
              scale: 1
            }}
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: pos.delay
            }}
            className="absolute w-1 h-1 bg-[#c9a84c] rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
