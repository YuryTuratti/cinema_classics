import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "I'm gonna make him an offer he can't refuse.", film: "The Godfather" },
  { text: "May the Force be with you.", film: "Star Wars" },
  { text: "You talking to me?", film: "Taxi Driver" },
  { text: "E.T. phone home.", film: "E.T." },
  { text: "Here's Johnny!", film: "The Shining" },
  { text: "After all, tomorrow is another day!", film: "Gone with the Wind" },
  { text: "Houston, we have a problem.", film: "Apollo 13" },
  { text: "To infinity and beyond!", film: "Toy Story" },
];

export default function ClassicQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex flex-col items-end justify-center max-w-[300px] text-right">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <p className="text-sm md:text-base text-zinc-400 italic font-serif leading-snug">
            &ldquo;{quotes[index].text}&rdquo;
          </p>
          <p className="text-xs font-bold text-yellow-600 mt-1 uppercase tracking-wider not-italic">
            — {quotes[index].film}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
