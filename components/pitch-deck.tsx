"use client";

import { useState, useCallback, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { pitchPages, type PitchPage } from "@/lib/pitch-data";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Mail, Globe, MessageCircle, ArrowLeft } from "lucide-react";

function PageIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-primary font-medium tabular-nums">
        {String(current + 1).padStart(2, "0")}
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground tabular-nums">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-0.5 bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function NavigationButton({ 
  direction, 
  onClick, 
  disabled 
}: { 
  direction: "prev" | "next"; 
  onClick: () => void; 
  disabled: boolean;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 ease-out
        ${disabled 
          ? "opacity-30 cursor-not-allowed" 
          : "hover:bg-secondary active:scale-95"
        }
        ${isPrev ? "text-muted-foreground" : "text-foreground"}
      `}
      aria-label={isPrev ? "Previous page" : "Next page"}
    >
      {isPrev ? (
        <>
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Back</span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">Continue</span>
          <ChevronRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

function LinkIcon({ url }: { url: string }) {
  if (url.startsWith("mailto:")) return <Mail className="w-4 h-4" />;
  if (url.includes("twitter") || url.includes("x.com")) return <MessageCircle className="w-4 h-4" />;
  if (url.includes(".com") && !url.includes("@")) return <Globe className="w-4 h-4" />;
  return <ExternalLink className="w-4 h-4" />;
}

function PageCard({ page, isActive }: { page: PitchPage; isActive: boolean }) {
  return (
    <div
      className={`
        absolute inset-0 overflow-y-auto
        transition-all duration-500 ease-out
        ${isActive 
          ? "opacity-100 translate-x-0" 
          : "opacity-0 translate-x-8 pointer-events-none"
        }
      `}
    >
      {/* Mobile-first vertical layout */}
      <div className="flex flex-col min-h-full">
        {/* Full-width image at top - always visible, controlled height */}
        {page.image && (
          <div className="relative w-full h-[38vh] flex-shrink-0">
            <img
              src={page.image.url || "/placeholder.svg"}
              alt={page.image.alt}
              className="w-full h-full object-cover"
            />
            {/* Soft gradient overlay for text readability below */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 px-5 py-6">
          <div className="w-full max-w-lg mx-auto space-y-5">
            {/* Subtitle */}
            <p className="text-primary text-xs tracking-widest uppercase font-sans">
              {page.subtitle}
            </p>

            {/* Title */}
            <h1 className="font-serif text-3xl font-light text-foreground leading-tight text-balance">
              {page.title}
            </h1>

            {/* Content */}
            <div className="space-y-3">
              {page.content.map((paragraph, i) => (
                <p 
                  key={i} 
                  className="text-muted-foreground text-sm leading-relaxed font-sans"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Highlights */}
            {page.highlights && (
              <div className="flex flex-wrap gap-2 pt-1">
                {page.highlights.map((highlight, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-secondary/80 text-secondary-foreground rounded-full font-sans"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {page.links && (
              <div className="flex flex-col gap-2.5 pt-3">
                {page.links.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      window.open(link.url, "_blank", "noopener,noreferrer");
                    }}
                    className="
                      inline-flex items-center justify-center gap-2 px-4 py-3
                      bg-primary text-primary-foreground
                      rounded-lg font-sans text-sm font-medium
                      transition-all duration-300
                      hover:opacity-90 active:scale-98
                      w-full
                    "
                  >
                    <LinkIcon url={link.url} />
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PitchDeck() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pitchPages.length;

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  // Signal to Farcaster that the app is ready to display
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch/swipe support
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      
      if (touchStartX - touchEndX > swipeThreshold) {
        goToNext();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        goToPrev();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToNext, goToPrev]);

  return (
    <div className="min-h-dvh flex flex-col bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header - compact for mobile */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border/30">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground tracking-wide hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </Link>
        <PageIndicator current={currentPage} total={totalPages} />
      </header>

      {/* Main content area */}
      <main className="flex-1 relative overflow-hidden">
        {pitchPages.map((page, index) => (
          <PageCard 
            key={page.id} 
            page={page} 
            isActive={index === currentPage} 
          />
        ))}
      </main>

      {/* Footer navigation - compact for mobile */}
      <footer className="px-5 py-3 space-y-2.5 border-t border-border/30">
        <ProgressBar current={currentPage} total={totalPages} />
        <div className="flex items-center justify-between">
          <NavigationButton
            direction="prev"
            onClick={goToPrev}
            disabled={currentPage === 0}
          />
          <NavigationButton
            direction="next"
            onClick={goToNext}
            disabled={currentPage === totalPages - 1}
          />
        </div>
      </footer>
    </div>
  );
}
