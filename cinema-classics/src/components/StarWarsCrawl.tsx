import { motion } from "framer-motion";
import { useMemo } from "react";

const quotesDB: Record<number, string[]> = {
  0: [ // DOMINGO (Família/Reflexão)
    "HAKUNA MATATA: É LINDO DIZER!",
    "AO INFINITO E ALÉM!",
    "A VIDA É COMO UMA CAIXA DE CHOCOLATES...",
    "NÃO HÁ LUGAR COMO O NOSSO LAR.",
    "OHANA QUER DIZER FAMÍLIA.",
    "DOMINGO É DIA DE CINEMA CLASSICS.",
  ],
  1: [ // SEGUNDA (Motivação/Foco)
    "EU VOU FAZER UMA OFERTA IRRECUSÁVEL.",
    "O SHOW TEM QUE CONTINUAR.",
    "APENAS CONTINUE A NADAR...",
    "É PRECISO MUITA CORAGEM PARA ENFRENTAR OS INIMIGOS...",
    "CARPE DIEM. APROVEITEM O DIA, GAROTOS.",
    "QUE A FORÇA ESTEJA COM VOCÊ NESTA SEGUNDA.",
  ],
  2: [ // TERÇA (Ação/Sci-Fi)
    "HASTA LA VISTA, BABY.",
    "EU VOLTAREI.",
    "COM GRANDES PODERES VÊM GRANDES RESPONSABILIDADES.",
    "HOUSTON, TEMOS UM PROBLEMA.",
    "VIVO OU MORTO, VOCÊ VEM COMIGO.",
    "TERÇA-FEIRA: MISSÃO DADA É MISSÃO CUMPRIDA.",
  ],
  3: [ // QUARTA (Fantasia/Meio da Semana)
    "ÀS QUARTAS, USAMOS ROSA.",
    "VOCÊ É UM BRUXO, HARRY.",
    "MEU PRECIOSO...",
    "EU VEJO PESSOAS MORTAS.",
    "ELEMENTAR, MEU CARO WATSON.",
    "MEIO DA SEMANA: A MAGIA ACONTECE.",
  ],
  4: [ // QUINTA (TBT/Nostalgia)
    "TOTO, ACHO QUE NÃO ESTAMOS MAIS NO KANSAS.",
    "BOM DIA, VIETNÃ!",
    "E.T. TELEFONE MINHA CASA.",
    "ESTE É O INÍCIO DE UMA BELA AMIZADE.",
    "NÓS SEMPRE TEREMOS PARIS.",
    "QUINTA-FEIRA: RELEMBRAR É VIVER.",
  ],
  5: [ // SEXTA (Festa/Liberdade)
    "A VIDA PASSA MUITO RÁPIDO. SE NÃO PARAR, VOCÊ PERDE.",
    "NINGUÉM COLOCA BABY NO CANTO.",
    "AO INFINITO E ALÉM (DO FINAL DE SEMANA)!",
    "SHOW ME THE MONEY!",
    "WILSON! CADÊ VOCÊ, WILSON?!",
    "SEXTOU NO CINEMA CLASSICS!",
  ],
  6: [ // SÁBADO (Épico/Blockbuster)
    "WAKANDA PARA SEMPRE!",
    "EU SOU O HOMEM DE FERRO.",
    "CORRA, FORREST, CORRA!",
    "EU SOU O REI DO MUNDO!",
    "QUE OS JOGOS COMECEM.",
    "SÁBADO: A GRANDE ESTREIA.",
  ],
};

export default function StarWarsCrawl() {
  const todayQuotes = useMemo(() => {
    const dayIndex = new Date().getDay();
    const daily = quotesDB[dayIndex] ?? quotesDB[0];
    return [...daily, ...daily];
  }, []);

  return (
    <div
      className="absolute right-4 top-24 w-[400px] h-32 overflow-hidden hidden md:flex justify-center z-0"
      style={{
        perspective: "400px",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 100%)",
      }}
    >
      <motion.div
        className="absolute top-0 w-full h-fit text-[#FFE81F]/80 font-bold text-center text-lg leading-loose tracking-wide uppercase"
        style={{ rotateX: "20deg", transformOrigin: "bottom center" }}
        initial={{ opacity: 0, y: "0%" }}
        animate={{ opacity: 1, y: ["0%", "-50%"] }}
        transition={{
          y: {
            repeat: Infinity,
            repeatDelay: 0,
            duration: 35,
            ease: "linear",
          },
          opacity: {
            duration: 2,
            delay: 4.5,
            ease: "easeOut",
          },
        }}
      >
        {/* Cópia 1 */}
        <div className="pb-6">
          {todayQuotes.slice(0, todayQuotes.length / 2).map((quote, i) => (
            <p key={`a-${i}`} className="mb-4 drop-shadow-lg whitespace-nowrap px-4">
              {quote}
            </p>
          ))}
        </div>
        {/* Cópia 2 (loop seamless) */}
        <div className="pb-6">
          {todayQuotes.slice(todayQuotes.length / 2).map((quote, i) => (
            <p key={`b-${i}`} className="mb-4 drop-shadow-lg whitespace-nowrap px-4">
              {quote}
            </p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
