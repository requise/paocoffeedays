export type MediaItem = {
  title?: string;
  src: string;
  alt: string;
  href?: string;
};

export type SocialLink = {
  label: string;
  handle: string;
  reach: string;
  views: string;
  href: string;
  logo: string;
};

export const navItems = ["about", "work", "services", "contact"];

export const offers = [
  "Use my code PAO10 to get 10% off your OutIn order.",
  "Orders over $200 automatically get 10% off.",
  "paocoffeedays on IKAPE products to get 20% off."
];

export const heroMedia: MediaItem[] = [
  {
    src: "/hero-woahhh.png",
    alt: "Coffee product unboxing reel by Pao Canopin",
    href: "https://www.instagram.com/reel/DXD1wpykznm/"
  },
  {
    src: "/hero-iced-americano.png",
    alt: "Iced Americano paid collaboration reel for a coffee brand",
    href: "https://www.instagram.com/reel/DYeVZP3Tpe9/"
  },
  {
    src: "/hero-marastamp.png",
    alt: "MARASTAMP coffee culture brand feature by paocoffeedays",
    href: "https://www.instagram.com/reel/DXo53OFky_v/"
  }
];

export const socialStats: SocialLink[] = [
  {
    label: "Instagram",
    handle: "followers",
    reach: "3.4k+",
    views: "1m+",
    href: "https://www.instagram.com/pao.coffeedays",
    logo: "/social-ig.png"
  },
  {
    label: "Tiktok",
    handle: "followers",
    reach: "3k+",
    views: "78k+",
    href: "https://www.tiktok.com/@pao.coffeedays",
    logo: "/social-tiktok.png"
  },
  {
    label: "facebook",
    handle: "followers",
    reach: "9.8k+",
    views: "500k+",
    href: "https://www.facebook.com/Pao.coffeedays",
    logo: "/social-fb.png"
  }
];

export const brandLogos = [
  { name: "OutIn", src: "/logo-outin.png" },
  { name: "OREA", src: "/logo-orea.png" },
  { name: "IKAPE", src: "/logo-ikape.png" },
  { name: "brewista", src: "/logo-brewista.png" },
  { name: "codale", src: "/logo-codale.png" }
];

export const contentCards: MediaItem[] = [
  {
    src: "/content-satire.jpg",
    alt: "Coffee satire content reel by paocoffeedays",
    href: "https://www.instagram.com/reel/DXpUC5hE4k-/"
  },
  {
    src: "/content-unboxing.jpg",
    alt: "Product unboxing short-form coffee content by Pao Canopin",
    href: "https://www.instagram.com/reel/DXD1wpykznm/"
  },
  {
    src: "/content-paid-collab.jpg",
    alt: "Paid collaboration iced coffee reel by paocoffeedays",
    href: "https://www.instagram.com/reel/DYeVZP3Tpe9/"
  },
  {
    src: "/content-lifestyle.jpg",
    alt: "Lifestyle coffee content reel for a paid social campaign",
    href: "https://www.instagram.com/reel/DXn8VJnExoA/"
  }
];

export const siteUrl = "https://paocoffeedays.com";

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/about#person`,
      name: "Pao Canopin",
      alternateName: "paocoffeedays",
      url: `${siteUrl}/about`,
      image: `${siteUrl}/pao-profile.jpg`,
      jobTitle: "Coffee UGC Creator",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Caloocan",
        addressRegion: "Metro Manila",
        addressCountry: "PH"
      },
      sameAs: [
        "https://www.instagram.com/pao.coffeedays",
        "https://www.tiktok.com/@pao.coffeedays",
        "https://www.facebook.com/pao.coffeedays"
      ],
      knowsAbout: [
        "coffee UGC",
        "short-form video",
        "Instagram Reels",
        "TikTok content",
        "coffee brand collaborations"
      ]
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/about#ugc-service`,
      name: "Coffee UGC content creation",
      provider: { "@id": `${siteUrl}/about#person` },
      areaServed: ["Philippines", "Metro Manila"],
      serviceType: "UGC video production",
      description:
        "Short-form coffee content for TikTok, Instagram Reels, and Facebook, including product unboxing, paid collaborations, satire, and lifestyle reels.",
      offers: {
        "@type": "Offer",
        price: "100",
        priceCurrency: "USD",
        description: "Starter UGC package from $100+"
      }
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/about#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What kind of content does paocoffeedays create?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "paocoffeedays creates coffee-focused UGC, product unboxing, satire, lifestyle reels, paid collaborations, and short-form social campaigns."
          }
        },
        {
          "@type": "Question",
          name: "Where is Pao Canopin based?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pao Canopin is based in Caloocan, Metro Manila, Philippines."
          }
        }
      ]
    }
  ]
};
