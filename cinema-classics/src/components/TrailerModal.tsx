import { Star, StarHalf, ExternalLink, ListPlus, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Movie } from "@/components/CinemaClassics";

// ─── Helpers ─────────────────────────────────────────────────
function generateEmojiRating(nota: number): { full: number; half: boolean; empty: number } {
  const stars = Math.round((nota / 10) * 5 * 2) / 2;
  const full = Math.floor(stars);
  const half = stars % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

function StarRating({ nota }: { nota: number }) {
  const { full, half, empty } = generateEmojiRating(nota);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      ))}
      {half && <StarHalf className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-4 w-4 text-gray-600" />
      ))}
      <span className="ml-2 text-sm text-gray-400">{nota.toFixed(1)}</span>
    </div>
  );
}

// ─── Componente ──────────────────────────────────────────────
interface TrailerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrailerModal({ movie, isOpen, onClose }: TrailerModalProps) {
  if (!movie) return null;

  const youtubeId = movie.video_url
    ? movie.video_url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]+)/)?.[1]
    : null;

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    : null;

  const handleWatchNow = () => {
    if (movie.video_url) {
      window.open(movie.video_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-gray-950 border-gray-800 text-white p-0 overflow-hidden
                   sm:max-w-3xl max-h-[90vh] overflow-y-auto"
        showCloseButton={true}
      >
        {/* Área de vídeo / poster */}
        <div className="relative aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Trailer: ${movie.titulo_pt}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : movie.poster ? (
            <div className="relative w-full h-full">
              <img
                src={movie.backdrop || movie.poster}
                alt={movie.titulo_pt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Film className="h-12 w-12 opacity-50" />
                  <span className="text-sm">Trailer indisponível</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Film className="h-16 w-16 text-gray-700" />
            </div>
          )}
        </div>

        {/* Metadados */}
        <div className="px-6 pb-2">
          <DialogHeader className="gap-3">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-bold text-white leading-tight">
                {movie.titulo_pt}
              </DialogTitle>
              <span className="shrink-0 inline-flex items-center rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-400">
                {movie.ano}
              </span>
            </div>

            <StarRating nota={movie.nota} />

            <DialogDescription className="text-yellow-500 font-medium text-base">
              {movie.headline}
            </DialogDescription>
          </DialogHeader>

          {/* Sinopse */}
          <div className="mt-4">
            <p className="text-gray-300 leading-relaxed text-sm">{movie.sinopse}</p>
          </div>
        </div>

        {/* Ações */}
        <DialogFooter className="px-6 pb-6 pt-2 flex-row gap-3">
          {movie.video_url && (
            <Button
              onClick={handleWatchNow}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
                         hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-200
                         active:scale-95 flex-1 sm:flex-none"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Assistir Agora
            </Button>
          )}
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white
                       transition-all duration-200 active:scale-95 flex-1 sm:flex-none"
          >
            <ListPlus className="h-4 w-4 mr-2" />
            Adicionar à Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
