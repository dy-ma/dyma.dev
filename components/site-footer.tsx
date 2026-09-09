const contactLinks = [
  { href: 'mailto:dylanmouang@gmail.com', label: 'Email' },
  { href: 'https://www.linkedin.com/in/dylan-mou-ang', label: 'LinkedIn' },
  { href: 'https://github.com/dy-ma', label: 'GitHub' },
  { href: 'https://x.com/dymaonx', label: 'Twitter' },
] as const;

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="mt-[clamp(34px,8vw,64px)] block pt-[clamp(22px,3.4vw,30px)] pb-[22px] max-[760px]:pb-5"
      aria-labelledby="contact-title"
    >
      <div className="footer-shell mx-auto w-[min(calc(100%_-_48px),1040px)] max-[760px]:w-[min(calc(100%_-_28px),100%)]">
        <div className="w-full border-t border-rule pt-[clamp(8px,1.5vw,12px)]">
          <p
            id="contact-title"
            className="text-[clamp(1.9rem,5vw,2.7rem)] leading-none font-light tracking-[-0.04em]"
          >
            Contact
          </p>
          <p className="mt-[0.45rem] max-w-[32ch] text-[0.95rem] text-faded">
            Get in touch if you’d like to chat.
          </p>
          <nav
            aria-label="Contact links"
            className="mt-[0.95rem] flex flex-wrap gap-x-[1.3rem] gap-y-4 max-[540px]:mt-3 max-[540px]:gap-x-[0.8rem] max-[540px]:gap-y-[0.7rem]"
          >
            {contactLinks.map((link) => {
              const isEmail = link.href.startsWith('mailto:');
              return (
                <a
                  key={link.label}
                  className="text-[0.95rem] italic underline-offset-[0.18em] hover:opacity-60 focus-visible:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-ink"
                  href={link.href}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noreferrer'}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
