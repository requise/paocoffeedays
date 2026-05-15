import { Instagram, Play, Video } from "lucide-react";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/pao.coffeedays", icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@pao.coffeeday", icon: Play },
  { label: "Facebook", href: "https://www.facebook.com/Pao.coffeedays", icon: Video }
];

export default function Home() {
  return (
    <main className="simple-page min-h-screen overflow-hidden bg-ristretto text-crema">
      <div className="fixed inset-0 -z-10">
        <div className="espresso-wash" />
        <div className="grain" />
      </div>

      <section className="simple-hero mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        <p className="launch-badge w-fit">
          <span className="badge-pulse" />
          Launching Soon
        </p>

        <p className="mt-10 font-sans text-xs uppercase tracking-[0.38em] text-brass">
          Pao Canopin
        </p>

        <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.82] tracking-normal text-crema">
          Brewing Stories.
          <span className="block italic text-oat">Creating Influence.</span>
        </h1>

        <p className="mt-9 max-w-2xl text-base leading-8 text-oat/86 sm:text-lg">
          The official portfolio of Pao Canopin — showcasing coffee culture,
          creative campaigns, brand collaborations, and digital storytelling.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                className="social-link"
                href={social.href}
                aria-label={social.label}
              >
                <Icon size={17} />
                <span>{social.label}</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
