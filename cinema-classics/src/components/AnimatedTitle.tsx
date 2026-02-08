import { motion } from "framer-motion";

export const AnimatedTitle = () => {
  const text = "CINEMA CLASSICS";
  const letters = Array.from(text);

  // Configuração do Container (Orquestrador)
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 2.8,
      },
    },
  };

  // Configuração de Cada Letra (A Queda)
  const child = {
    hidden: {
      y: -200,
      opacity: 0,
      rotate: -45,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
        duration: 3,
      },
    },
  };

  return (
    <motion.div
      className="flex overflow-hidden"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="text-4xl md:text-6xl font-black text-white tracking-tighter"
          style={{
            display: "inline-block",
            marginRight: letter === " " ? "1rem" : "0",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};
