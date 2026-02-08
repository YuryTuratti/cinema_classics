import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => Promise<void>;
  isLoading: boolean;
  onClear: () => void;
}

export default function SearchBar({ onSearch, isLoading, onClear }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canSearch = searchTerm.trim().length > 0 && !isLoading;

  const handleSearch = () => {
    const term = searchTerm.trim();
    if (!term || isLoading) return;
    onSearch(term);
  };

  const handleClear = () => {
    setSearchTerm("");
    onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div
        className="flex items-center gap-3 p-2 rounded-sm bg-black/60 border border-gray-800
                    hover:border-yellow-500/40 focus-within:border-yellow-500 focus-within:ring-1
                    focus-within:ring-yellow-500/30 transition-all duration-300"
      >
        {/* Ícone de busca */}
        <Search className="h-5 w-5 text-gray-500 ml-3 shrink-0" aria-hidden="true" />

        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar filmes clássicos..."
          aria-label="Campo de busca de filmes"
          className="flex-1 border-0 bg-transparent text-white placeholder:text-gray-500
                     focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-base shadow-none"
        />

        {/* Botão limpar */}
        {searchTerm.length > 0 && (
          <button
            type="button"
            role="button"
            aria-label="Limpar busca"
            onClick={handleClear}
            className="p-1.5 rounded-sm text-gray-500 hover:text-white hover:bg-gray-800
                       transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Botão pesquisar */}
        <Button
          type="button"
          role="button"
          aria-label="Pesquisar filmes"
          onClick={handleSearch}
          disabled={!canSearch}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold h-10 px-5
                     rounded-sm disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20
                     active:scale-95 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Buscando...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
