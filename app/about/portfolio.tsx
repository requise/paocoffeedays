"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import {
  brandLogos,
  contentCards,
  heroMedia,
  navItems,
  offers,
  socialStats,
  structuredData,
  type MediaItem
} from "../lib/constants";

type CarouselPosition = "left" | "center" | "right";

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
  priority = false,
  loading
}: {
  item: MediaItem;
  className?: string;
  linkFrame?: boolean;
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  const frame = (
    <figure
      className={`media-frame ${className}`}
      style={imageStyle(item.src)}
      aria-label={`${item.title ?? item.alt} image slot`}
    >
      <Image
        className="media-image"
        src={item.src}
        alt={item.alt}
        fill
        priority={priority}
        loading={loading}
        sizes="(max-width: 640px) 78vw, (max-width: 980px) 36vw, 24vw"
      />
      {item.title ? (
        <div className="media-fallback">
          <strong>{item.title}</strong>
        </div>
      ) : null}
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
      aria-label={`Open ${item.title ?? item.alt} reel on Instagram`}
    >
      {frame}
    </a>
  );
}

export default function Portfolio() {
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
        <a className="brand" href="/matchadays" aria-label="paocoffeedays home">
          paocoffeedays
        </a>
        <nav aria-label="Primary navigation">
          <a href="/matchadays">matchadays</a>
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
              src: "/pao-profile.jpg",
              alt: "Pao Canopin, coffee UGC creator behind paocoffeedays"
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
          {contentCards.map((item, index) => (
            <a
              className="content-card"
              key={item.src}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <MediaFrame item={item} linkFrame={false} loading={index === 0 ? "eager" : "lazy"} />
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
