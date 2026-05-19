"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";

type MediaItem = {
  title: string;
  label: string;
  src: string;
  alt: string;
  caption?: string;
  href?: string;
};

type SocialLink = {
  label: string;
  handle: string;
  reach: string;
  views: string;
  href: string;
  logo: string;
};

type CarouselPosition = "left" | "center" | "right";

const navItems = ["about", "work", "services", "contact"];

const offers = [
  "Use my code PAO10 to get 10% off your Oudin order.",
  "Orders over $200 automatically get 10% off.",
  "paocoffeedays on IKAPE products to get 20% off."
];

const heroMedia: MediaItem[] = [
  {
    title: "WOAHHH!!",
    label: "Product Unboxing",
    src: "/hero-woahhh.png",
    alt: "Coffee product unboxing reel by Pao Canopin",
    caption: "warm cafe table storytelling",
    href: "https://www.instagram.com/reel/DXD1wpykznm/"
  },
  {
    title: "Iced Americano",
    label: "Paid Collaboration",
    src: "/hero-iced-americano.png",
    alt: "Iced Americano paid collaboration reel for a coffee brand",
    caption: "pushed by Oudin Milk",
    href: "https://www.instagram.com/reel/DYeVZP3Tpe9/"
  },
  {
    title: "MARASTAMP",
    label: "Brand Feature",
    src: "/hero-marastamp.png",
    alt: "MARASTAMP coffee culture brand feature by paocoffeedays",
    caption: "coffee culture highlight"
  }
];

const socialStats: SocialLink[] = [
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
    href: "https://www.tiktok.com/@pao.coffeeday",
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

const brandLogos = [
  { name: "Oudin", src: "/logo-oudin.png" },
  { name: "OREA", src: "/logo-orea.png" },
  { name: "IKAPE", src: "/logo-ikape.png" },
  { name: "brewista", src: "/logo-brewista.png" }
];

const contentCards: MediaItem[] = [
  {
    title: "Satire",
    label: "320k+ views across IG, fb and tiktok",
    src: "/content-satire.jpg",
    alt: "Coffee satire content reel by paocoffeedays",
    caption: "coffee humor in cafe light",
    href: "https://www.instagram.com/reel/DXpUC5hE4k-/"
  },
  {
    title: "Product Unboxing",
    label: "180k+ views across IG, fb and tiktok",
    src: "/content-unboxing.jpg",
    alt: "Product unboxing short-form coffee content by Pao Canopin",
    caption: "WOAHHH!!",
    href: "https://www.instagram.com/reel/DXD1wpykznm/"
  },
  {
    title: "Paid Collaboration",
    label: "Featured across TikTok, Instagram, and Facebook",
    src: "/content-paid-collab.jpg",
    alt: "Paid collaboration iced coffee reel by paocoffeedays",
    caption: "Iced Americano",
    href: "https://www.instagram.com/reel/DYeVZP3Tpe9/"
  },
  {
    title: "Lifestyle Content",
    label: "Paid Social Campaign Cinematic short-form content for Meta",
    src: "/content-lifestyle.jpg",
    alt: "Lifestyle coffee content reel for a paid social campaign",
    caption: "Slow Morning",
    href: "https://www.instagram.com/reel/DXn8VJnExoA/"
  }
];

const siteUrl = "https://paocoffeedays.com";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Pao Canopin",
      alternateName: "paocoffeedays",
      url: siteUrl,
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
        "https://www.tiktok.com/@pao.coffeeday",
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
      "@id": `${siteUrl}/#ugc-service`,
      name: "Coffee UGC content creation",
      provider: { "@id": `${siteUrl}/#person` },
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
      "@id": `${siteUrl}/#faq`,
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

function imageStyle(src: string): CSSProperties {
  return {
    "--media-src": `url("${src}")`
  } as CSSProperties;
}

function getCarouselPosition(
  index: number,
  activeIndex: number
): CarouselPosition {
  if (index === activeIndex) {
    return "center";
  }

  const nextIndex = (activeIndex + 1) % heroMedia.length;
  return index === nextIndex ? "right" : "left";
}

function MediaFrame({
  item,
  className = "",
  linkFrame = true,
  priority = false
}: {
  item: MediaItem;
  className?: string;
  linkFrame?: boolean;
  priority?: boolean;
}) {
  const frame = (
    <figure
      className={`media-frame ${className}`}
      style={imageStyle(item.src)}
      aria-label={`${item.title} image slot`}
    >
      <Image
        className="media-image"
        src={item.src}
        alt={item.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 78vw, (max-width: 980px) 36vw, 24vw"
      />
      <div className="media-fallback">
        <span>{item.caption}</span>
        <strong>{item.title}</strong>
      </div>
    </figure>
  );

  if (!item.href || !linkFrame) {
    return frame;
  }

  return (
    <a
      className="media-link"
      href={item.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${item.title} reel on Instagram`}
    >
      {frame}
    </a>
  );
}

export default function Home() {
  const [carouselIndex, setCarouselIndex] = useState(1);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % heroMedia.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isInquiryOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInquiryOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isInquiryOpen]);

  const handleDotClick = (index: number) => {
    setCarouselIndex(index);
  };

  const openInquiryModal = () => {
    setIsInquiryOpen(true);
  };

  const closeInquiryModal = () => {
    setIsInquiryOpen(false);
  };

  const handleInquirySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(inquirySubject.trim());
    const body = encodeURIComponent(
      `Your email: ${inquiryEmail.trim()}\n\nInquiry:\n${inquiryContent.trim()}`
    );
    window.location.href = `mailto:requise.pao@gmail.com?subject=${subject}&body=${body}`;
    setIsInquiryOpen(false);
  };

  return (
    <main className="portfolio-page bg-black text-white">
      <aside className="offer-strip" aria-label="Discount offers">
        <div className="offer-marquee">
          {[...offers, ...offers].map((offer, index) => (
            <span key={`${offer}-${index}`}>{offer}</span>
          ))}
        </div>
      </aside>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="paocoffeedays home">
          paocoffeedays
        </a>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item} href={`#${item}`}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <h1>
            Scroll-stopping UGC blending storytelling, satire, and cinematic
            visuals.
          </h1>
          <p>
            Coffee-focused UGC with humor, visuals, and personality.
          </p>
          <button className="orange-button" type="button" onClick={openInquiryModal}>
            work with me
          </button>
        </div>

        <div className="hero-reel" aria-label="Featured content previews">
          {heroMedia.map((item, index) => {
            const position = getCarouselPosition(index, carouselIndex);

            return (
              <MediaFrame
                key={item.src}
                item={item}
                className={`carousel-card carousel-${position} ${
                  position === "center" ? "is-featured" : ""
                }`}
              />
            );
          })}
          <div className="carousel-dots" aria-hidden="true">
            {heroMedia.map((_, index) => (
              <span
                key={index}
                className={index === carouselIndex ? "active" : ""}
                onClick={() => handleDotClick(index)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-visual">
          <MediaFrame
            item={{
              title: "Pao Canopin",
              label: "Creator portrait",
              src: "/pao-profile.jpg",
              alt: "Pao Canopin, coffee UGC creator behind paocoffeedays",
              caption: "coffee creator portrait"
            }}
            className="portrait-frame"
            priority
          />
          <span className="views-label">views</span>
        </div>

        <article className="about-copy">
          <p className="intro-line">Hello fellow humans</p>
          <h2>I&apos;m Pao</h2>
          <p>
            6 years in the Philippine coffee industry -- from local brand
            collaborations and bar takeovers to guest brewing, hosting
            competitions, and creating storytelling-driven content for coffee
            and lifestyle brands.
          </p>
          <p>
            I started making videos because creating things felt fun, and
            eventually it became my way of helping brands feel more human
            online.
          </p>
          <p>
            I&apos;m currently open to collaborations starting at $100+, keeping my
            rates approachable while continuously investing into better gear and
            higher-quality productions.
          </p>
          <p>
            But even if your project isn&apos;t paid, feel free to still reach out. I
            genuinely enjoy collaborating, connecting with people, and creating
            meaningful content together.
          </p>
          <p>Just send a message or email -- I&apos;d love to hear your ideas.</p>
          <button className="orange-button" type="button" onClick={openInquiryModal}>
            work with me
          </button>
        </article>
      </section>

      <section className="stats-section" aria-labelledby="audience-title">
        <h2 id="audience-title">Audience Overview</h2>
        <div className="stats-grid">
          {socialStats.map((social) => (
            <a
              className="stat-card"
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
            >
              <div className="stat-topline">
                <span>{social.label}</span>
                <Image src={social.logo} alt="" width={26} height={26} />
              </div>
              <small>{social.handle}</small>
              <strong>{social.reach}</strong>
              <small>total views</small>
              <strong>{social.views}</strong>
            </a>
          ))}
        </div>
      </section>

      <h2 className="brand-heading">Brands collaborated with me</h2>
      <section className="brand-section" aria-label="Brands collaborated with me">
        <div className="brand-strip">
          {brandLogos.map((brand) => (
            <div
              className="brand-logo"
              key={brand.name}
              style={imageStyle(brand.src)}
              aria-label={`${brand.name} logo slot`}
            />
          ))}
        </div>
      </section>

      <section id="work" className="content-section">
        <h2>My contents:</h2>
        <div className="content-grid">
          {contentCards.map((item) => (
            <a
              className="content-card"
              key={item.src}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <MediaFrame item={item} linkFrame={false} />
              <h3>{item.title}</h3>
              <p>{item.label}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="message-block">
          <p>Work with me:</p>
          <h2>UGC that feels native, useful, and watchable.</h2>
          <span>Starter package from $100+</span>
          <button className="orange-button" type="button" onClick={openInquiryModal}>
            Send a message
          </button>
        </div>

        <article className="package-card">
          <span className="package-eyebrow">Starter package</span>
          <h2>UGC PACKAGES</h2>
          <p>
            Short-form content for TikTok, Instagram Reels, and Facebook. Built
            around your brand, edited for retention, and ready for organic use.
          </p>
          <ul className="package-list">
            <li>1 vertical reel (30-60 seconds)</li>
            <li>Filming + editing included</li>
            <li>Organic usage rights</li>
          </ul>
        </article>
      </section>

      <footer id="contact" className="footer-section">
        <div>
          <h2>Pao Canopin</h2>
          <p>
            <MapPin size={14} aria-hidden="true" />
            Metro Manila Caloocan Philippines
          </p>
          <p>
            <Phone size={14} aria-hidden="true" />
            +63 995 483 6976
          </p>
          <div className="footer-socials">
            <a
              href="https://www.tiktok.com/@pao.coffeedays"
              aria-label="TikTok"
              target="_blank"
              rel="noreferrer"
            >
              <Image src="/social-tiktok.png" alt="" width={22} height={22} />
            </a>
            <a
              href="https://www.instagram.com/pao.coffeedays"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Image src="/social-ig.png" alt="" width={22} height={22} />
            </a>
            <a
              href="https://www.facebook.com/Pao.coffeedays"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <Image src="/social-fb.png" alt="" width={22} height={22} />
            </a>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          {navItems.map((item) => (
            <a key={item} href={`#${item}`}>
              {item}
            </a>
          ))}
        </nav>
      </footer>

      {isInquiryOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeInquiryModal}
        >
          <section
            className="inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span>Send inquiry</span>
                <h2 id="inquiry-title">Work with me</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close inquiry form"
                onClick={closeInquiryModal}
              >
                ×
              </button>
            </div>

            <form className="inquiry-form" onSubmit={handleInquirySubmit}>
              <label>
                <span>Your email</span>
                <input
                  type="email"
                  value={inquiryEmail}
                  onChange={(event) => setInquiryEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                <span>Subject</span>
                <input
                  type="text"
                  value={inquirySubject}
                  onChange={(event) => setInquirySubject(event.target.value)}
                  placeholder="UGC collaboration inquiry"
                  required
                />
              </label>
              <label>
                <span>Inquiry</span>
                <textarea
                  value={inquiryContent}
                  onChange={(event) => setInquiryContent(event.target.value)}
                  placeholder="Tell me about your brand, timeline, content needs, and budget."
                  rows={7}
                  required
                />
              </label>
              <p>Inquiry will be sent to requise.pao@gmail.com</p>
              <button className="orange-button" type="submit">
                Open email
              </button>
            </form>
          </section>
        </div>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
