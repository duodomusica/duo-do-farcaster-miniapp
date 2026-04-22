/**
 * Dúo Dø - Show Pitch 2026
 * 
 * Page data structure for the pitch deck.
 * Edit the content below to customize the pitch.
 * 
 * Image mapping:
 * - Each page has an optional image URL
 * - Images are displayed as mood-setting visuals
 * - Replace URLs to update photos
 */

export interface PitchPage {
  id: string;
  subtitle: string;
  title: string;
  content: string[];
  highlights?: string[];
  links?: { label: string; url: string }[];
  image?: {
    url: string;
    alt: string;
  };
  funding?: {
    current: number;
    goal: number;
    label: string;
  };
}

export const pitchPages: PitchPage[] = [
  {
    id: "intro",
    subtitle: "Who we are",
    title: "Dúo Dø",
    content: [
      "Genre-free & in-motion music",
      "With over a decade of international performances and a repertoire that seamlessly moves across genres, they invite audiences on a journey of sensations, in stories transformed into songs."
    ],
    image: {
      url: "/images/17-07-2024-musicaw3-fotos-fede-kaplun-25.jpg",
      alt: "Dúo Dø performing on stage with dramatic blue and red lighting"
    }
  },
  {
    id: "background",
    subtitle: "The Story",
    title: "Born in Buenos Aires",
    content: [
      "Founded in 2015 as a space for experimentation and composition by musicians, composers, and educators Clementine Esquivel and Santiago Reos.",
      "They have performed in Argentina, Japan, Brazil, France, Spain, and the USA. Among them, their two Japan Tours with sold-out shows and vinyl records stand out."
    ],
    highlights: [
      "Argentina",
      "Japan",
      "Brazil", 
      "France",
      "Spain",
      "USA"
    ],
    image: {
      url: "/images/dsc0146.jpg",
      alt: "Clementine Esquivel singing passionately in purple kimono"
    }
  },
  {
    id: "onchain",
    subtitle: "The Concept",
    title: "Onchain Performance",
    content: [
      "A performance blending soulful vocals, acoustic instruments, and experimental textures into a genre-free set of original songs.",
      "All the songs in the setlist have been minted, turning the concert into an onchain experience that bridges live performance with the permanence and innovation of decentralized technologies."
    ],
    image: {
      url: "/images/du-cc-81odo12.jpeg",
      alt: "Dúo Dø duo performing together with vocalist arms outstretched"
    }
  },

  {
    id: "web3",
    subtitle: "Building Onchain",
    title: "Web 3 Presence",
    content: [
      "Performed live across the Web3 ecosystem including Devconnect ARG 2025, Bitconf (2023 & 2025), Decentraland Music Festival (Main Stage), Farcaster Friday Tokyo 2024, and Future of Music by Solana.",
      "In Argentina, presented at the Web3 Music Exhibition at Palacio Libertad, Live at Wosco Art Gallery (sponsored by Nouns), and The Creator Economy at Aleph Crecimiento."
    ],
    highlights: [
      "Devconnect ARG 2025",
      "Decentraland Main Stage",
      "Farcaster Friday Tokyo",
      "Future of Music by Solana"
    ],
    image: {
      url: "/images/dsc-5874.jpg",
      alt: "Santiago Reos playing acoustic guitar with focused expression"
    }
  },
  {
    id: "community",
    subtitle: "The Ecosystem",
    title: "Community First",
    content: [
      "Dúo Dø has built a solid community across chains and countries. Collectors, listeners, and supporters are not passive audiences, but active participants in the project's journey.",
      "The community supports releases, live shows, and long-term sustainability of the craft. They are involved in conversations, decisions, and the spaces where the music lives."
    ],
    image: {
      url: "/images/dsc0239.jpg",
      alt: "Both performers in an intimate musical moment on stage"
    }
  },

  {
    id: "contact",
    subtitle: "Let's Connect",
    title: "Book the Show",
    content: [
      "Ready to bring Dúo Dø to your event, festival, or venue? We'd love to hear from you."
    ],
    links: [
      { label: "duodomusica@gmail.com", url: "mailto:duodomusica@gmail.com" },
      { label: "duodomusica.com", url: "https://www.duodomusica.com" }
    ],
    image: {
      url: "/images/dsc-5941.jpg",
      alt: "Wide shot of both performers in blue and magenta stage lighting"
    }
  }
];
