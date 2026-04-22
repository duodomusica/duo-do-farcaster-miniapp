"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ChevronDown } from "lucide-react";
import { pitchPages } from "@/lib/pitch-data";
import { ContributeButton } from "@/components/contribute-button";

type AudioDetail = {
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
};

const SONG_SLUGS = ["palomas-y-cordajes", "juro-que", "amarillo"] as const;

/* ─── Helpers ──────────────────────────────────────────── */

/**
 * Detect if we're running inside a Farcaster mini app (Warpcast WebView).
 * Mini apps cannot open other mini apps (e.g. Tortoise) directly.
 */
function isMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("warpcast") ||
    ua.includes("farcaster") ||
    window.parent !== window
  );
}

/**
 * Open an external URL safely from within a Farcaster mini app.
 * Uses sdk.actions.openUrl when available (forces external browser),
 * falls back to window.open, and ultimately falls back to a
 * Warpcast compose link sharing the URL.
 */
function openExternalUrl(url: string) {
  if (isMiniApp()) {
    try {
      sdk.actions.openUrl(url);
    } catch {
      // sdk.actions.openUrl not available, try window.open
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) {
        // Popup blocked or mini app restriction, fallback to compose
        window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(url)}`;
      }
    }
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/* ─── Configuration ─────────────────────────────────────── */

const FUNDING_CURRENT = 3176.2;
const FUNDING_GOAL = 3000;

const HERO_IMAGE = "/images/dsc-5864.jpg";

/**
 * Executive Producers - people who have contributed.
 * Add new entries here as contributions come in.
 * 
 * - `name`: Display name (Farcaster username, ENS, etc.)
 * - `avatar`: URL to their Farcaster profile image, or `null` for initials fallback.
 *   Farcaster avatar URL pattern: https://i.imgur.com/XXXXX.jpg or from warpcast CDN
 */
const EXECUTIVE_PRODUCERS: { name: string; avatar: string | null; contribution: number }[] = [
  { name: "Purple DAO", avatar: "/images/purple-dao-cuadrada.png", contribution: 845 },
  { name: "Zaal", avatar: "/images/zaal-cuadrada.png", contribution: 100 },
  { name: "Carol", avatar: "/images/carol-cuadrada.jpg", contribution: 100 },
  { name: "RGBEE", avatar: "/images/rgbee-cuadrada.png", contribution: 300 },
  { name: "Luciano", avatar: "/images/luciano-cuadrada.png", contribution: 50 },
  { name: "Tom", avatar: "/images/tom-cuadrada.png", contribution: 33 },
  { name: "leaolmos.eth", avatar: "/images/leaolmos-cuadrada.png", contribution: 50 },
  { name: "CXY", avatar: "/images/cxy-cuadrada.png", contribution: 200 },
  { name: "noel", avatar: "/images/noel-cuadrada.png", contribution: 15 },
  { name: "diavholistic", avatar: "/images/diavholistic-cuadrada.png", contribution: 10 },
  { name: "nejoout", avatar: "/images/nejoout-cuadrada.png", contribution: 10 },
  { name: "sato99", avatar: "/images/sato99-cuadrada.png", contribution: 10 },
  { name: "coolbeans1r.eth", avatar: "/images/coolbeans-cuadrada.png", contribution: 4.20 },
  { name: "joec", avatar: "/images/joec-cuadrada.png", contribution: 2 },
  { name: "sweetman.eth", avatar: "/images/sweetman-cuadrada.png", contribution: 333 },
  { name: "sardius", avatar: "/images/sardius-cuadrada.png", contribution: 11 },
  { name: "0xleo", avatar: "/images/0xleo-cuadrada.png", contribution: 1.5 },
  { name: "Nico Pisarello", avatar: "/images/nico-pisarello-cuadrada.png", contribution: 75 },
  { name: "statuette", avatar: "/images/statuette-cuadrada.png", contribution: 21 },
  { name: "les", avatar: "/images/les-cuadrada.png", contribution: 55 },
  { name: "deshsax.eth", avatar: "/images/deshsax-cuadrada.png", contribution: 10 },
  { name: "Harvey Heith", avatar: "/images/harvey-heith-cuadrada.png", contribution: 100 },
  { name: "hedan13", avatar: "/images/hedan13-cuadrada.png", contribution: 150 },
  { name: "stipinpixel", avatar: "/images/stipinpixel-cuadrada.png", contribution: 1 },
  { name: "laequis.eth", avatar: "/images/laequis-cuadrada.png", contribution: 4 },
  { name: "Tano Franzoni", avatar: "/images/tano-franzoni-cuadrada.png", contribution: 50 },
  { name: "herimax", avatar: "/images/herimax-cuadrada.png", contribution: 11.5 },
  { name: "robertpo4p", avatar: "/images/robertpo4p-cuadrada.png", contribution: 1 },
  { name: "Taro Nagano", avatar: "/images/taro-nagano-cuadrada.png", contribution: 100 },
  { name: "grabululu", avatar: "/images/grabululu-cuadrada.png", contribution: 1 },
  { name: "dnznjuan", avatar: "/images/dnznjuan-cuadrada.png", contribution: 5 },
  { name: "Tajibea", avatar: "/images/tajibea-cuadrada.png", contribution: 77 },
  { name: "yerbearserker", avatar: "/images/yerbearserker-cuadrada.png", contribution: 3 },
  { name: "ds8", avatar: "/images/ds8-cuadrada.png", contribution: 10 },
  { name: "yes2crypto.eth", avatar: "/images/yes2crypto-cuadrada.png", contribution: 100 },
  { name: "adrienne", avatar: "/images/adrienne-cuadrada.png", contribution: 20 },
  { name: "Jorge Pisarello", avatar: "/images/jorge-pisarello-cuadrada.png", contribution: 100 },
  { name: "0xZara.eth", avatar: "/images/0xzara-cuadrada.png", contribution: 2.23 },
  { name: "pauher", avatar: "/images/pauher-cuadrada.png", contribution: 2 },
  { name: "janicka", avatar: "/images/janicka-cuadrada.png", contribution: 3 },
  { name: "dwn2erth.eth", avatar: "/images/dwn2erth-cuadrada.png", contribution: 10 },
  { name: "ezincrypto", avatar: "/images/ezincrypto-cuadrada.png", contribution: 3 },
  { name: "chamaland", avatar: "/images/chamaland-cuadrada.png", contribution: 1 },
  { name: "arjantupan", avatar: "/images/arjantupan-cuadrada.png", contribution: 5 },
  { name: "marydeer", avatar: "/images/marydeer-cuadrada.png", contribution: 2 },
  { name: "Hugo", avatar: "/images/hugo-cuadrada.png", contribution: 55 },
  { name: "David Panozo", avatar: "/images/david-panozo-cuadrada.png", contribution: 50 },
  { name: "sebas.eth", avatar: "/images/sebas-cuadrada.png", contribution: 30 },
  { name: "0xbianc8.eth", avatar: "/images/0xbianc8-cuadrada.png", contribution: 10 },
  { name: "ivannalen", avatar: "/images/ivannalen-cuadrada.png", contribution: 3 },
  { name: "attentiontrader.eth", avatar: "/images/attentiontrader-cuadrada.png", contribution: 20 },
  { name: "eggcooker", avatar: "/images/eggcooker-cuadrada.png", contribution: 10 },
].sort((a, b) => b.contribution - a.contribution);

const TORTOISE_ARTIST_URL = "https://tortoise.studio/?id=12f56c82-107b-46f3-93b7-8ba09cd99020";

/**
 * Prefilled text for Farcaster cast composer.
 * Edit this to change what gets shared in the feed.
 */
const SHARE_TEXT = [
  "@duodomusica is building their road to /farcon-rome \ud83c\uddee\ud83c\uddf9",
  "",
  "They were invited to join Kismet Casa as resident artists and perform live \u2014 and are opening the journey to the community.",
  "",
  "If you feel aligned, you can become an Executive Producer \ud83c\udfdb\ufe0f\u2728",
  "",
  "\ud83d\udc47",
  "",
  "https://farcaster.xyz/miniapps/qdooGiOr3FGt/do-d-at-farcon-rome",
].join("\n");

const BENEFITS = [
  "Above $1, the official Rome POAP created by artist Juan Reos for this occasion",
  "Above $10, POAP + your name included in the official FarCon recap blog credits",
  "Above $50, POAP + blog credits + a unique 1/1 Executive Producer NFT recognizing your support",
  "Everyone is supporting the creation of a new original song in collaboration with Tortoise, premiering at FarCon Rome",
];

/* ─── Sub-components ────────────────────────────────────── */

function FundingProgress() {
  const pct = Math.min((FUNDING_CURRENT / FUNDING_GOAL) * 100, 100);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(pct, 7)}%`,
            boxShadow: "0 0 10px oklch(0.75 0.12 60 / 0.5), 0 0 3px oklch(0.75 0.12 60 / 0.3)",
          }}
        />
      </div>

      {/* Numbers */}
      <div className="flex items-baseline justify-between font-sans">
        <span className="text-foreground text-lg font-semibold tabular-nums">
          {"$"}{FUNDING_CURRENT.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-sm tabular-nums">
          {"/ $"}{FUNDING_GOAL.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ProducerChip({ name, avatar, contribution }: { name: string; avatar: string | null; contribution: number }) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0 bg-secondary/50 rounded-full py-1.5 pl-1.5 pr-4">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-[10px] font-medium text-muted-foreground font-sans">{initials}</span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm text-foreground font-sans whitespace-nowrap leading-tight">{name}</span>
        <span className="text-[10px] text-muted-foreground/70 font-sans whitespace-nowrap leading-tight">
          {"$"}{contribution}
        </span>
      </div>
    </div>
  );
}



function TortoiseMusicSection() {
  const [songs, setSongs] = useState<(AudioDetail & { slug: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSongs() {
      try {
        const results = await Promise.all(
          SONG_SLUGS.map(async (slug) => {
            const res = await fetch(`https://tortoise.studio/api/getAudio?slug=${slug}`);
            if (!res.ok) return null;
            const data: AudioDetail = await res.json();
            return { ...data, slug };
          })
        );
        if (!cancelled) {
          const valid = results.filter((r): r is AudioDetail & { slug: string } => r !== null);
          setSongs(valid);
          setError(valid.length === 0);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSongs();
    return () => { cancelled = true; };
  }, []);

  const handlePlay = useCallback((slug: string, streamUrl: string) => {
    // If same track, toggle pause/play
    if (playingSlug === slug && audioRef.current) {
      audioRef.current.pause();
      setPlayingSlug(null);
      return;
    }

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(streamUrl);
    audio.play();
    audio.onended = () => setPlayingSlug(null);
    audioRef.current = audio;
    setPlayingSlug(slug);
  }, [playingSlug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <section className="space-y-5">
        <h2 className="text-primary text-sm tracking-widest uppercase font-sans text-center">
          Our Music
        </h2>
        <button
          onClick={() => openExternalUrl(TORTOISE_ARTIST_URL)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border text-sm text-muted-foreground font-sans transition-all hover:text-foreground hover:border-muted-foreground active:scale-[0.98]"
        >
          Listen on Tortoise
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <h2 className="text-primary text-sm tracking-widest uppercase font-sans text-center">
        Listen on Tortoise
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-secondary/30 rounded-lg animate-pulse">
              <div className="w-10 h-10 rounded-md bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-2.5 bg-muted/60 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => {
            const isPlaying = playingSlug === song.slug;
            return (
              <div
                key={song.slug}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-secondary/40 rounded-lg"
              >
                {/* Play/Pause button */}
                <button
                  onClick={() => handlePlay(song.slug, song.url)}
                  className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 group"
                  aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    {isPlaying ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Song info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-foreground font-sans truncate">{song.title}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-sans">{song.artist}</p>
                </div>

                {/* Link to Tortoise */}
                <button
                  onClick={() => openExternalUrl(`https://tortoise.studio/song/${song.slug}`)}
                  className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-secondary"
                  aria-label={`Open ${song.title} on Tortoise`}
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* View artist profile link */}
      <button
        onClick={() => openExternalUrl(TORTOISE_ARTIST_URL)}
        className="w-full text-center text-xs text-muted-foreground/60 font-sans hover:text-muted-foreground transition-colors"
      >
        View all on Tortoise
      </button>
    </section>
  );
}

function LearnMoreSection() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonId = "learn-more-btn";

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      setIsOpen(false);
      setTimeout(() => {
        document.getElementById(buttonId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  return (
    <section className="pb-6">
      <button
        id={buttonId}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg border border-border text-sm text-muted-foreground font-sans transition-all hover:text-foreground hover:border-muted-foreground active:scale-[0.98]"
      >
        {"Learn more about D\u00FAo D\u00F8"}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div id="learn-more" className="space-y-10 pt-8 pb-8">
          {pitchPages.map((page) => (
            <article key={page.id} className="space-y-4">
              {page.image && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img
                    src={page.image.url}
                    alt={page.image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-primary text-xs tracking-widest uppercase font-sans">
                {page.subtitle}
              </p>
              <h3 className="font-serif text-2xl font-light text-foreground leading-tight text-balance">
                {page.title}
              </h3>
              <div className="space-y-3">
                {page.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed font-sans">
                    {paragraph}
                  </p>
                ))}
              </div>
              {page.highlights && (
                <div className="flex flex-wrap gap-2">
                  {page.highlights.map((h) => (
                    <span key={h} className="px-2.5 py-1 text-xs bg-secondary/80 text-secondary-foreground rounded-full font-sans">
                      {h}
                    </span>
                  ))}
                </div>
              )}
              {page.links && (
                <div className="flex flex-col gap-2.5">
                  {page.links.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => openExternalUrl(link.url)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-sans text-sm transition-all hover:opacity-90 active:scale-[0.98] w-full"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Main ──────────────────────────────────────────────── */

export function FundraisePage() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Leaderboard view
  if (showLeaderboard) {
    return (
      <div
        className="min-h-dvh bg-background flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold font-sans text-foreground pr-12">
            Leaderboard
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            {EXECUTIVE_PRODUCERS.map((p, index) => (
              <div
                key={p.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="w-6 text-center text-sm font-medium text-muted-foreground font-sans">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground font-sans">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground font-sans truncate">
                  {p.name}
                </span>
                <span className="text-sm font-semibold text-primary font-sans">
                  ${p.contribution.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh bg-background flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative w-full h-[44vh] flex-shrink-0">
        <img
          src={HERO_IMAGE}
          alt="Dúo Dø performing live on stage"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Title overlaid at bottom of hero */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 md:text-center">
          <p className="text-primary text-xs tracking-widest uppercase font-sans mb-2">
            Become an Executive Producer
          </p>
          <h1 className="font-serif text-3xl font-light text-foreground leading-tight text-balance">
            Road to FarCon Rome
          </h1>
        </div>
      </section>

      {/* ── Scrollable content ───────────────────────── */}
      <main className="flex-1 px-5 py-6 space-y-10">
        <div className="max-w-lg mx-auto space-y-10">
          {/* Explanation */}
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              {"Goal reached! Our flights and residency at "}
              <span className="text-foreground">Kismet Casa (Rome)</span>
              {" are now secured thanks to our "}
              <span className="text-foreground font-medium">Executive Producers</span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              {"The campaign remains open for those who wish to join. Extra funds will go toward filming a music video for the new song we've composed specifically for "}
              <span className="text-foreground">FarCon</span>.
            </p>
          </section>

          {/* Progress bar */}
          <section>
            <FundingProgress />
          </section>

          {/* Executive Producers */}
          <section className="space-y-5">
            <h2 className="text-primary text-sm tracking-widest uppercase font-sans text-center">
              Our Executive Producers
            </h2>
            {EXECUTIVE_PRODUCERS.length > 0 ? (
              <div className="overflow-hidden -mx-5">
                <div className="flex gap-3 animate-marquee w-max">
                  {EXECUTIVE_PRODUCERS.map((p) => (
                    <ProducerChip key={`a-${p.name}`} name={p.name} avatar={p.avatar} contribution={p.contribution} />
                  ))}
                  {EXECUTIVE_PRODUCERS.map((p) => (
                    <ProducerChip key={`b-${p.name}`} name={p.name} avatar={p.avatar} contribution={p.contribution} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 rounded-lg border border-dashed border-border/60 flex items-center justify-center">
                <p className="text-sm text-muted-foreground/60 font-sans">
                  Be the first to join
                </p>
              </div>
            )}
            {EXECUTIVE_PRODUCERS.length > 0 && (
              <button
                onClick={() => setShowLeaderboard(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm text-muted-foreground font-sans transition-all hover:text-foreground active:scale-[0.98]"
              >
                View Leaderboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </section>

          {/* CTA - Contribute via wallet */}
          <ContributeButton />

          {/* Alternative: reach out via email */}
          <section className="space-y-3">
            <button
              onClick={() => {
                const subject = encodeURIComponent("Executive Producer \u2014 Rome 2026");
                const body =
                  "I%20would%20love%20to%20join%20as%20an%20Executive%20Producer%20for%20Rome%202026%20%F0%9F%87%AE%F0%9F%87%B9" +
                  "%0A%0A" +
                  "Please%20find%20my%20details%20below%3A" +
                  "%0A%0A" +
                  "Name%20to%20be%20displayed%3A%0A" +
                  "Farcaster%20username%3A%0A" +
                  "Contribution%20amount%20(USDC)%3A" +
                  "%0A%0A" +
                  "Excited%20to%20support%20this%20journey%20%E2%9C%A8";
                window.open(
                  `mailto:duodomusica@gmail.com?subject=${subject}&body=${body}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border text-sm text-muted-foreground font-sans transition-all hover:text-foreground hover:border-muted-foreground active:scale-[0.98]"
            >
              Or reach out via email
            </button>
          </section>

          {/* Benefits */}
          <section className="space-y-5">
            <h2 className="text-primary text-sm tracking-widest uppercase font-sans text-center text-balance">
              {"As an Executive Producer, You Will Receive"}
            </h2>
            <ul className="space-y-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">{benefit}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Tortoise Music */}
          <TortoiseMusicSection />

         {/* Share in feed */}
<section>
  <button
    onClick={async () => {
      try {
        await sdk.actions.composeCast({
          text: SHARE_TEXT,
          embeds: [
            "https://farcaster.xyz/miniapps/qdooGiOr3FGt/do-d-at-farcon-rome"
          ]
        });
      } catch {
        const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_TEXT)}`;
        openExternalUrl(composeUrl);
      }
    }}
    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border text-sm text-muted-foreground font-sans transition-all hover:text-foreground hover:border-muted-foreground active:scale-[0.98]"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline strokeLinecap="round" strokeLinejoin="round" points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" />
    </svg>
    Share in feed
  </button>
</section>

          {/* Learn more - reveal + scroll */}
          <LearnMoreSection />
        </div>
      </main>
    </div>
  );
}
