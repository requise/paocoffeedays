import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Instagram, Facebook, Leaf, Mountain, Sprout } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sift Matcha — Worth the whisk",
  description: "Meet Sift Saemidori × Okumidori. First-flush matcha from Kagoshima, Japan. A little green for your everyday, by paocoffeedays.",
  alternates: { canonical: "/matchadays" },
  openGraph: {
    title: "Sift Matcha — Worth the whisk",
    description: "Premium Japanese matcha. A slower kind of energy.",
    url: "/matchadays",
    type: "website",
    images: [{ url: "/matchadays/sift-product-hero.png", width: 1254, height: 1254, alt: "Sift Saemidori Okumidori matcha" }]
  },
  twitter: { card: "summary_large_image", title: "Sift Matcha — Worth the whisk", images: ["/matchadays/sift-product-hero.png"] }
};

// Display exact artwork from the supplied brand board through a responsive crop.
function BrandArtwork({ x, y, width, height, alt, className = "" }: {
  x: number; y: number; width: number; height: number; alt: string; className?: string;
}) {
  return <span className={`${styles.artwork} ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
    <Image src="/matchadays/sift-brand-board.png" alt={alt} width={1214} height={1295}
      sizes="1214px" style={{ width: `${1214 / width * 100}%`, maxWidth: "none", height: "auto", left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
  </span>;
}

function SiftLogo() {
  return <BrandArtwork x={24} y={24} width={178} height={91} alt="Sift" className={styles.logo} />;
}

const instagramOrder = "https://ig.me/m/pao.coffeedays";
const facebookOrder = "https://www.facebook.com/Pao.coffeedays";

export default function MatchaDays() {
  return (
    <main className={styles.page} id="top">
      <div className={styles.announcement}><span>A little green in your everyday. <span>Worth the whisk.</span></span><a href="#order">Order now <ArrowUpRight size={13} /></a></div>
      <header className={styles.header}>
        <Link href="/matchadays" className={styles.brand} aria-label="Sift home"><SiftLogo /></Link>
        <nav aria-label="Primary navigation">
          <a href="#matcha">Our matcha</a><a href="#ritual">The ritual</a><Link href="/about">About Pao <ArrowUpRight size={13} /></Link>
        </nav>
        <a href="#order" className={styles.headerCta}>Order here <ArrowUpRight size={15} /></a>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <h1 id="hero-title">Premium matcha,<br /><span>worth the whisk.</span></h1>
          <p className={styles.intro}>First-flush matcha from Kagoshima, Japan.<br />A little pause. A brighter daily ritual.</p>
          <a href="#order" className={styles.button}>Order here <ArrowRight size={18} /></a>
          <p className={styles.heroNote}>30g <span>·</span> First Flush <span>·</span> Premium Grade</p>
        </div>
        <div className={styles.heroVisual}>
          <Image src="/matchadays/sift-product-hero.png" alt="Sift Saemidori Okumidori tin with a cloud of green matcha powder" width={1254} height={1254} sizes="(max-width: 760px) 100vw, 55vw" priority className={styles.productImage} />
          <span className={styles.verticalNote}>PURE. SIMPLE. BETTER. BRIGHTER.</span>
        </div>
        <div className={styles.heroBottom}><span>MATCHADAYS BY PAOCOFFEEDAYS</span><span>FROM KAGOSHIMA, WITH CARE <ArrowUpRight size={14} /></span></div>
      </section>

      <section className={styles.matcha} id="matcha" aria-labelledby="matcha-title">
        <div className={styles.matchaIntro}>
          <p className={styles.eyebrow}>MEET YOUR MATCHA</p>
          <h2 id="matcha-title">Two cultivars.<br />One considered cup.</h2>
          <p>A carefully selected blend of Saemidori and Okumidori. A 30g tin, ready for your everyday.</p>
          <a href="#order" className={styles.textLink}>Order Sift <ArrowUpRight size={16} /></a>
        </div>
        <div className={styles.origins}>
          <article><Leaf strokeWidth={1.3} /><h3>Saemidori ×<br />Okumidori</h3><p>Two Japanese matcha cultivars, together in one blend.</p></article>
          <article><Mountain strokeWidth={1.3} /><h3>Kagoshima</h3><p>From the green landscapes of southern Japan.</p></article>
          <article><Sprout strokeWidth={1.3} /><h3>First flush</h3><p>The first harvest of the season. A fresh start to your ritual.</p></article>
        </div>
      </section>

      <section className={styles.story} aria-label="The Sift everyday ritual">
        <div className={styles.storyPhoto}>
          <Image src="/matchadays/sift-matcha-lifestyle-hero.png" alt="Sift matcha, a ceramic bowl, and a bamboo whisk in morning light" fill sizes="(max-width: 760px) 100vw, 60vw" />
          <div className={styles.photoCaption}><p className={styles.eyebrow}>MAKE A LITTLE TIME FOR YOU</p><h2>A slower<br />kind of energy.</h2></div>
        </div>
        <div className={styles.storyCard}>
          <p className={styles.eyebrow}>SMALL RITUALS. GOOD DAYS.</p>
          <h2>More matcha.<br />Brighter days.</h2>
          <BrandArtwork x={804} y={20} width={116} height={94} alt="Sift's playful cat mascot dancing with a whisk" className={styles.mascot} />
          <p>Sift, whisk, and find your moment.<br />Good things take a little whisk.</p>
        </div>
      </section>

      <section className={styles.ritual} id="ritual" aria-labelledby="ritual-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SIMPLE STEPS. BETTER DAYS.</p><h2 id="ritual-title">How to whisk.</h2></div><p>Just a few minutes.<br />A moment that&apos;s all yours.</p></div>
        <div className={styles.steps}>
          <article><Image src="/matchadays/ritual-scoop.png" alt="A bamboo spoonful of finely ground matcha above a ceramic bowl" width={1254} height={1254} sizes="(max-width: 360px) 100px, (max-width: 760px) 125px, 33vw" className={styles.ritualImage} /><div className={styles.stepHeading}><span>01</span><h3>Scoop & sift</h3></div><p>Add your measured matcha to a bowl, sifting for a smoother cup.</p></article>
          <article><Image src="/matchadays/ritual-whisk.png" alt="A bamboo whisk mixing matcha in a ceramic bowl" width={1254} height={1254} sizes="(max-width: 360px) 100px, (max-width: 760px) 125px, 33vw" className={styles.ritualImage} /><div className={styles.stepHeading}><span>02</span><h3>Whisk</h3></div><p>Add warm water and whisk briskly until smooth and frothy.</p></article>
          <article><Image src="/matchadays/ritual-enjoy.png" alt="A ceramic bowl of freshly whisked matcha with delicate green foam" width={1254} height={1254} sizes="(max-width: 360px) 100px, (max-width: 760px) 125px, 33vw" className={styles.ritualImage} /><div className={styles.stepHeading}><span>03</span><h3>Make it yours</h3></div><p>Sip it straight or add your favorite milk. Enjoy your little pause.</p></article>
        </div>
      </section>

      <section className={styles.callout} id="order" aria-labelledby="callout-title">
        <div className={styles.orderCopy}>
          <p className={styles.eyebrow}>YOUR DAILY RITUAL STARTS HERE</p>
          <h2 id="callout-title">Make it a matcha day.</h2>
          <p className={styles.orderNote}>Online checkout coming soon. Order now through Instagram or Facebook — message us for availability and ordering details.</p>
        </div>
        <div className={styles.orderActions}>
          <a href={instagramOrder} className={styles.button} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Order on Instagram <ArrowUpRight size={16} /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          <a href={facebookOrder} className={`${styles.button} ${styles.facebookButton}`} target="_blank" rel="noopener noreferrer"><Facebook size={17} /> Order on Facebook <ArrowUpRight size={16} /><span className={styles.srOnly}> (opens in a new tab)</span></a>
        </div>
      </section>
      <footer className={styles.footer}>
        <div><Link href="/matchadays" aria-label="Sift home"><SiftLogo /></Link><p className={styles.tagline}>WORTH THE WHISK.</p></div>
        <p>Matchadays by paocoffeedays.<br /><span>A little green. A little joy. Every day.</span></p>
        <nav aria-label="Footer navigation"><Link href="/about">Meet Pao <ArrowUpRight size={13} /></Link><Link href="/about#contact">Get in touch <ArrowUpRight size={13} /></Link><a href="#top">Back to top ↑</a></nav>
      </footer>
    </main>
  );
}

