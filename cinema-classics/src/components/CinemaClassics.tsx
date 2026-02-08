import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import StarWarsCrawl from "@/components/StarWarsCrawl";
import { toast } from "sonner";
import {
  Search,
  X,
  Star,
  StarHalf,
  Play,
  Film,
  Clock,
  User,
  Tv,
} from "lucide-react";

// ─── Interface (normalizada) ─────────────────────────────────
export interface Movie {
  id: number | string;
  titulo: string;
  poster: string;
  backdrop?: string;
  nota?: number;
  headline: string;
  sinopse?: string;
  ano: string;
  tipo?: "movie" | "tv";
  video_url?: string | null;
}

// ─── Normaliza um item vindo do backend (aceita ambas as chaves) ──
function normalizeMovie(raw: any): Movie {
  return {
    id: raw.id_original ?? raw.id ?? Math.random(),
    titulo: raw.titulo_pt ?? raw.titulo ?? "Sem título",
    poster: raw.poster ?? raw.poster_path ?? "",
    backdrop: raw.backdrop ?? raw.backdrop_path ?? undefined,
    nota: raw.nota ?? raw.vote_average ?? undefined,
    headline: raw.headline ?? "",
    sinopse: raw.sinopse ?? raw.overview ?? undefined,
    ano: raw.ano ?? "",
    tipo: raw.tipo ?? undefined,
    video_url: raw.video_url ?? null,
  };
}

// ─── Extrai o array de itens de qualquer formato de resposta ──
function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.series)) return data.series;
    if (Array.isArray(data.filmes)) return data.filmes;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
  }
  return [];
}

// ─── Helpers ─────────────────────────────────────────────────
function generateEmojiRating(nota: number): { full: number; half: boolean; empty: number } {
  const stars = Math.round((nota / 10) * 5 * 2) / 2; // arredonda para 0.5
  const full = Math.floor(stars);
  const half = stars % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

// ─── StarRating ──────────────────────────────────────────────
function StarRating({ nota }: { nota: number }) {
  const { full, half, empty } = generateEmojiRating(nota);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
      ))}
      {half && <StarHalf className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-3.5 w-3.5 text-zinc-700" />
      ))}
      <span className="ml-1 text-xs text-zinc-500">{nota.toFixed(1)}</span>
    </div>
  );
}

// ─── LazyImage ───────────────────────────────────────────────
function LazyImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`overflow-hidden bg-muted ${className}`}>
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Film className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}

// ─── SearchBar ───────────────────────────────────────────────
function SearchBar({
  searchTerm,
  isSearching,
  isSearchMode,
  onSearchTermChange,
  onSearch,
  onClear,
  history,
  placeholder,
}: {
  searchTerm: string;
  isSearching: boolean;
  isSearchMode: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: (term: string) => Promise<void>;
  onClear: () => void;
  history: string[];
  placeholder: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex gap-3 w-full max-w-2xl">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchTermChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && searchTerm.trim() && onSearch(searchTerm.trim())}
            className="pl-10 h-11 rounded-full bg-zinc-900/50 backdrop-blur-sm border-zinc-800
                       text-foreground placeholder:text-zinc-600
                       focus:border-yellow-600/40 focus:ring-yellow-600/10
                       focus:shadow-[0_0_24px_rgba(202,138,4,0.06)] font-sans text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        </div>
        <Button
          onClick={() => searchTerm.trim() && onSearch(searchTerm.trim())}
          disabled={isSearching || !searchTerm.trim()}
          className="h-11 px-5 rounded-full bg-yellow-600 hover:bg-yellow-500 text-black
                     font-semibold disabled:opacity-40 uppercase tracking-wider text-xs
                     transition-all duration-300"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <Film className="h-4 w-4 animate-spin" /> Buscando...
            </span>
          ) : (
            "Buscar"
          )}
        </Button>
        {isSearchMode && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="h-11 w-11 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/60
                       transition-all duration-300 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Histórico de buscas recentes */}
      {history.length > 0 && (
        <div className="flex items-center gap-3 mt-4 max-w-2xl flex-wrap">
          <Clock className="h-3 w-3 text-zinc-600 shrink-0" />
          {history.map((term) => (
            <span
              key={term}
              onClick={() => onSearch(term)}
              className="text-xs text-zinc-500 uppercase tracking-widest cursor-pointer
                         hover:text-yellow-500 transition-colors font-sans"
            >
              {term}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SearchResults ───────────────────────────────────────────
function SearchResults({
  movies,
  onSelect,
}: {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Film className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-sans">Nenhum filme encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ─── MovieCard ───────────────────────────────────────────────
function MovieCard({
  movie,
  onSelect,
}: {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}) {
  return (
    <div
      className="group relative rounded overflow-hidden bg-muted border border-border
                 hover:border-gold hover:shadow-lg hover:shadow-gold/10
                 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]
                 transition-all duration-300 cursor-pointer animate-slide-up"
      onClick={() => onSelect(movie)}
    >
      <div className="relative aspect-[2/3]">
        <LazyImage
          src={movie.poster}
          alt={movie.titulo}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {movie.video_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gold/90 rounded-sm p-3">
              <Play className="h-8 w-8 text-background fill-background" />
            </div>
          </div>
        )}
        {/* Badge de tipo */}
        {movie.tipo && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-black/80 border border-white/10
                          px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-yellow-500">
            {movie.tipo === "tv" ? <><Tv className="h-3 w-3" /> SÉRIE</> : <><Film className="h-3 w-3" /> FILME</>}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-foreground font-semibold text-lg leading-tight mb-1 line-clamp-1 font-display">
          {movie.titulo}
        </h3>
        <p className="text-muted-foreground text-sm mb-2 font-sans">{movie.ano}</p>
        {movie.nota != null && <StarRating nota={movie.nota} />}
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2 font-sans">{movie.headline}</p>
      </div>
    </div>
  );
}

// ─── TrailerModal ────────────────────────────────────────────
function TrailerModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  // Trava scroll do body quando modal está aberto
  useEffect(() => {
    if (movie) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  const [showPlayer, setShowPlayer] = useState(false);

  // Reseta player quando muda de filme
  useEffect(() => {
    setShowPlayer(false);
  }, [movie]);

  if (!movie) return null;

  // Extrai o ID do YouTube da URL /embed/xxxxx
  const ytId = movie.video_url
    ? movie.video_url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]+)/)?.[1] ?? null
    : null;

  // URL do embed (só usada depois de clicar play)
  const embedUrl = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  // URL para abrir no YouTube (aba nova)
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : null;

  // Thumbnail do YouTube em alta qualidade
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 max-h-[90vh] bg-zinc-950 rounded-md
                   overflow-y-auto border border-white/10 shadow-2xl animate-slide-up
                   overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/70 hover:bg-black rounded-sm p-2
                     text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Área de vídeo / poster */}
        <div className="relative w-full aspect-video bg-black">
          {showPlayer && embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Trailer: ${movie.titulo}`}
              className="absolute inset-0 w-full h-full rounded-t-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={ytThumb || movie.backdrop || movie.poster}
                alt={movie.titulo}
                className="absolute inset-0 w-full h-full object-cover rounded-t-md"
              />
              <div className="absolute inset-0 bg-black/40" />

              {ytId ? (
                <button
                  onClick={() => setShowPlayer(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Reproduzir trailer"
                >
                  <div className="bg-yellow-600/90 group-hover:bg-yellow-500 group-hover:scale-110
                                  rounded-sm p-4 transition-all duration-300 shadow-lg shadow-yellow-600/20">
                    <Play className="h-10 w-10 text-black fill-black" />
                  </div>
                </button>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Film className="h-12 w-12 opacity-50" />
                    <span className="text-sm">Trailer indisponível</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Metadados */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 font-sans leading-tight">
              {movie.titulo}
            </h2>
            <span className="shrink-0 inline-flex items-center rounded-sm bg-zinc-800 px-3 py-1
                           text-xs font-medium text-zinc-400 border border-white/5">
              {movie.ano}
            </span>
          </div>
          {movie.nota != null && <StarRating nota={movie.nota} />}
          <p className="text-yellow-600 font-medium mt-3 mb-2 text-sm sm:text-base font-sans">
            {movie.headline}
          </p>
          {movie.sinopse && (
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base font-sans">
              {movie.sinopse}
            </p>
          )}

          {/* Botões de ação */}
          {watchUrl && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setShowPlayer(true)}
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black
                           font-semibold px-5 py-2.5 rounded-sm transition-all duration-200
                           hover:scale-105 active:scale-95 uppercase tracking-wider text-xs"
              >
                <Play className="h-4 w-4 fill-black" />
                {showPlayer ? "Reproduzindo..." : "Assistir Trailer"}
              </button>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200
                           border border-white/10 hover:border-yellow-600/30
                           font-medium px-5 py-2.5 rounded-sm transition-all duration-200
                           hover:scale-105 active:scale-95 uppercase tracking-wider text-xs"
              >
                <Film className="h-4 w-4" />
                Abrir no YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Webhook URL (endpoint único) ────────────────────────────
const WEBHOOK_URL =
  "https://teste-n8n.dqnaqh.easypanel.host/webhook/lovable";

// ─── Mapa de gêneros (nome → [ID Filme, ID Série]) ──────────
const genreMap: Record<string, [number, number]> = {
  "Ação":               [28,    10759],  // Série: Action & Adventure
  "Aventura":           [12,    10759],  // Série: Action & Adventure
  "Animação":           [16,    16],
  "Comédia":            [35,    35],
  "Drama":              [18,    18],
  "Fantasia":           [14,    10765],  // Série: Sci-Fi & Fantasy
  "Ficção Científica":  [878,   10765],  // Série: Sci-Fi & Fantasy
  "Terror":             [27,    9648],   // Série: Mystery
  "Romance":            [10749, 18],     // Série: Drama
  "Suspense":           [53,    9648],   // Série: Mystery
};

function getGenreId(genreName: string, type: "movie" | "tv"): number | null {
  const ids = genreMap[genreName];
  if (!ids) return null;
  return type === "tv" ? ids[1] : ids[0];
}

// ═══ Componente Principal ════════════════════════════════════
export default function CinemaClassics() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showCurtain, setShowCurtain] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);

  // ── Carregar histórico do localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinemaHistory");
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // ── Fetch filmes (endpoint único) ──
  const fetchMovies = useCallback(async (search: string) => {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: search || "", type: searchType }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();

      // Extrai itens de qualquer formato de resposta
      const rawItems = extractItems(json);
      const normalized = rawItems.map(normalizeMovie);

      console.log(
        `✅ ${normalized.length} item(ns) carregado(s) [type=${searchType}]`,
        json.data_atualizacao ? `— atualizado em ${json.data_atualizacao}` : ""
      );

      return normalized;
    } catch (err) {
      console.error("Erro ao buscar filmes:", err);
      toast.error("Erro ao conectar com o servidor. Tente novamente.");
      return [];
    }
  }, [searchType]);

  // ── Carrega filmes sempre que fetchMovies mudar (inclui troca de tipo) ──
  useEffect(() => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearchMode(false);
    setActiveGenre(null);
    fetchMovies("").then((filmes) => setMovies(filmes));
  }, [fetchMovies]);

  // ── Cortina teatral ──
  useEffect(() => {
    const timer = setTimeout(() => setShowCurtain(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ── Pesquisa ──
  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);
    setSearchTerm(term);

    // Atualizar histórico
    setHistory((prev) => {
      const updated = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem("cinemaHistory", JSON.stringify(updated));
      return updated;
    });

    try {
      const filmes = await fetchMovies(term.trim());
      setSearchResults(filmes);
    } catch (err) {
      console.error("Erro na pesquisa:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearchMode(false);
  };

  // ── Filtrar por gênero via n8n ──
  const handleGenreClick = async (genreName: string) => {
    console.log("1. 🎬 Botão Clicado! Gênero:", genreName, "| Aba:", searchType);

    const genreId = getGenreId(genreName, searchType);
    console.log("2. 🔢 genre_id resolvido:", genreId, `(${searchType === "tv" ? "TV" : "Movie"} map)`);

    if (!genreId) {
      console.warn("⚠️ Gênero não encontrado no mapa:", genreName, "para tipo:", searchType);
      return;
    }

    // Toggle: clicar no mesmo gênero ativo desfaz o filtro
    if (activeGenre === genreName) {
      console.log("↩️ Toggle OFF — recarregando lista padrão");
      setActiveGenre(null);
      fetchMovies("").then((filmes) => setMovies(filmes));
      return;
    }

    const payloadType = searchType === "tv" ? "category_serie" : "category_filmes";
    console.log("3. 📡 Tipo definido:", payloadType);
    console.log("4. 🌐 Webhook URL:", WEBHOOK_URL);

    const payload = { type: payloadType, genre_id: genreId };
    console.log("5. 📦 Payload:", JSON.stringify(payload));

    try {
      setIsLoadingGenre(true);
      setActiveGenre(genreName);
      setIsSearchMode(false);
      setSearchTerm("");
      setSearchResults([]);

      console.log("6. 🚀 Enviando requisição...");

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("7. 📨 Status da resposta:", res.status, res.statusText);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      console.log("8. 📥 JSON bruto recebido:", json);

      const rawItems = extractItems(json);
      console.log("9. 📋 Itens extraídos:", rawItems.length);

      const normalized = rawItems.map(normalizeMovie);
      console.log(`✅ Gênero "${genreName}" (${genreId}) → ${normalized.length} resultado(s) [${payloadType}]`);

      setMovies(normalized);
    } catch (error) {
      console.error("❌ ERRO NO FETCH:", error);
      toast.error("Erro ao filtrar por gênero. Tente novamente.");
    } finally {
      setIsLoadingGenre(false);
    }
  };

  // ── Renderização (safe) ──
  const safeMovies = Array.isArray(movies) ? movies : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
  const displayMovies = isSearchMode ? safeSearchResults : safeMovies;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-foreground font-sans overflow-hidden">
      {/* ── Atmosphere: luz ambiente no topo ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[420px]
                        bg-[radial-gradient(ellipse_at_top,_rgba(202,138,4,0.07)_0%,_transparent_70%)]" />
        <div className="absolute top-0 right-0 w-[60%] h-[300px]
                        bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
      </div>

      {/* Cortina Teatral */}
      {showCurtain && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="w-1/2 h-full bg-gradient-to-r from-red-950 to-red-900 animate-curtain-left" />
          <div className="w-1/2 h-full bg-gradient-to-l from-red-950 to-red-900 animate-curtain-right" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-bold text-yellow-500 animate-fade-in font-display uppercase tracking-[0.12em]">
              Cinema Classics
            </h1>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div
        className={`relative z-10 transition-opacity duration-700 ${
          showCurtain ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header — Minimalista Fluido */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14 relative">
          {/* Login + Quotes — canto direito */}
          <div className="absolute top-5 right-6 flex flex-col items-end gap-3">
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-yellow-500 uppercase tracking-widest text-xs font-medium transition-colors duration-300"
              onClick={() => {}}
            >
              <User className="h-4 w-4 mr-2" />
              Acesso
            </Button>
            <StarWarsCrawl />
          </div>

          <Link
            to="/"
            className="cursor-pointer hover:opacity-80 transition-opacity block"
            onClick={(e) => {
              e.preventDefault();
              setSearchTerm("");
              setSearchResults([]);
              setIsSearchMode(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <AnimatedTitle />
            <p className="mt-2 text-zinc-600 text-sm md:text-base font-sans font-normal tracking-wide">
              Descubra os clássicos que marcaram a história
            </p>
          </Link>
        </header>

        {/* Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Abas: Filmes / Séries TV — Minimalista ── */}
          <nav className="flex items-center gap-8 mb-8">
            <button
              onClick={() => setSearchType("movie")}
              className={`relative flex items-center gap-2 pb-1 text-sm uppercase tracking-widest transition-all duration-300 ${
                searchType === "movie"
                  ? "text-yellow-500 font-bold"
                  : "text-zinc-500 font-medium hover:text-zinc-300"
              }`}
            >
              <Film className="h-4 w-4" />
              Filmes
              {searchType === "movie" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setSearchType("tv")}
              className={`relative flex items-center gap-2 pb-1 text-sm uppercase tracking-widest transition-all duration-300 ${
                searchType === "tv"
                  ? "text-yellow-500 font-bold"
                  : "text-zinc-500 font-medium hover:text-zinc-300"
              }`}
            >
              <Tv className="h-4 w-4" />
              Séries
              {searchType === "tv" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              )}
            </button>
          </nav>

          <SearchBar
            searchTerm={searchTerm}
            isSearching={isSearching}
            isSearchMode={isSearchMode}
            placeholder={searchType === "tv" ? "Buscar séries..." : "Buscar filmes..."}
            onSearchTermChange={setSearchTerm}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            history={history}
          />

          {/* Indicador do modo de busca */}
          {isSearchMode && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-sm text-zinc-400
                             bg-white/5 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 font-sans">
                <Search className="h-3.5 w-3.5" />
                Resultados para &quot;{searchTerm}&quot; — {searchResults.length} {searchType === "tv" ? "série(s)" : "filme(s)"}
              </span>
            </div>
          )}

          {/* ── Explore por Gêneros ── */}
          {!isSearchMode && (
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-4">
                Explore por Gêneros
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  "Ação", "Aventura", "Comédia", "Drama", "Fantasia",
                  "Ficção Científica", "Terror", "Romance", "Suspense", "Animação",
                ].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    disabled={isLoadingGenre}
                    className={`w-full text-center px-4 py-2.5 rounded-full border
                               text-sm font-medium uppercase tracking-wider cursor-pointer
                               transition-all duration-300 select-none disabled:opacity-50 disabled:cursor-wait
                               ${
                                 activeGenre === genre
                                   ? "border-yellow-500 text-yellow-500 bg-yellow-500/15 shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                                   : "border-zinc-700 text-zinc-400 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                               }`}
                  >
                    {isLoadingGenre && activeGenre === genre ? (
                      <span className="flex items-center justify-center gap-2">
                        <Film className="h-3.5 w-3.5 animate-spin" />
                        {genre}
                      </span>
                    ) : (
                      genre
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Título da seção de conteúdo ── */}
          <div className="border-l-4 border-yellow-500 pl-4 mb-8 mt-24">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide">
              {isSearchMode ? "RESULTADOS DA BUSCA" : "OS MELHORES DA SEMANA"}
            </h2>
          </div>

          {/* Grid de filmes ou resultados da pesquisa */}
          {isSearchMode ? (
            <SearchResults movies={safeSearchResults} onSelect={setSelectedMovie} />
          ) : safeMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Film className="h-16 w-16 mb-4 animate-pulse opacity-30" />
              <p className="text-lg font-sans">Nenhum conteúdo encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {displayMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={setSelectedMovie}
                />
              ))}
            </div>
          )}

          <SiteFooter />
        </main>
      </div>

      {/* Modal de trailer */}
      <TrailerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}
