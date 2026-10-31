import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  MapPinIcon,
  PlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata(
  "Recruitment across the UAE",
  site.description,
  "/",
);

const emirates = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];
const services = [
  {
    number: "01",
    icon: UsersThreeIcon,
    title: "People for your business.",
    text: "Tell us who you need. Our team reviews your requirements and helps you find suitable candidates.",
    label: "Hire talent",
    href: "/hire-talent",
    category: "For employers",
  },
  {
    number: "02",
    icon: BriefcaseIcon,
    title: "Space for your ambition.",
    text: "Explore available roles and find a new opportunity to put your experience to work.",
    label: "Explore opportunities",
    href: "/jobs",
    category: "For job seekers",
  },
  {
    number: "03",
    icon: FileTextIcon,
    title: "A conversation that counts.",
    text: "No suitable vacancy yet? Share your CV and tell our team what you would like to do next.",
    label: "Submit your CV",
    href: "/submit-cv",
    category: "For your next step",
  },
];
const steps = [
  [
    "Tell us what’s next.",
    "A new role or a growing team. Start by sharing what you’re looking for.",
  ],
  [
    "Find the right fit.",
    "Our team reviews requirements and applications, then coordinates suitable introductions.",
  ],
  [
    "Move forward, together.",
    "From shortlisting to interviews, we follow the conversation through to hiring.",
  ],
];
const questions = [
  [
    "How can my company request staff?",
    "Start with Hire Talent and share the role, number of people and work location. You can also speak to our team directly by phone, WhatsApp or email.",
  ],
  [
    "Can I share my CV without an open vacancy?",
    "Yes. Visit Submit CV for the available options. While online submissions are being prepared, you can email your CV to info@sankhala.ae.",
  ],
  [
    "Where does Sankhala work?",
    "Our service area covers Dubai and all UAE emirates. Tell us the location of the role or your preferred work location when you contact us.",
  ],
  [
    "Do I need to create an account?",
    "No candidate or company account is needed for the initial inquiry. Your first conversation is directly with our recruitment team.",
  ],
];

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="hero wrap" aria-labelledby="hero-heading">
        <div className="hero-media">
          <Image
            src="/images/recruitment-hero.webp"
            alt="An illustrative scene of professionals collaborating in a contemporary office"
            fill
            preload
            sizes="(max-width: 767px) 100vw, 1280px"
          />
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span className="red-dot" /> People first. Across the UAE.
          </p>
          <h1 id="hero-heading" className="hero-title">
            <span>
              Connecting people<span className="accent-dot">.</span>
            </span>
            <span>
              Building futures<span className="accent-dot">.</span>
            </span>
          </h1>
          <p className="hero-description">
            The people your business needs.
            <br />
            The opportunity you’ve been looking for.
          </p>
          <div className="hero-actions">
            <Link href="/hire-talent" className="button button-primary">
              Hire Talent <ArrowUpRightIcon size={20} aria-hidden="true" />
            </Link>
            <Link href="/jobs" className="button button-light">
              Find a Job <ArrowUpRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-bottom">
            <span>Recruitment. With a human touch.</span>
            <ArrowDownRightIcon size={22} aria-hidden="true" />
          </div>
        </div>
        <div className="hero-location">
          <MapPinIcon size={18} aria-hidden="true" />
          <span>Dubai roots. UAE reach.</span>
        </div>
        <span className="image-caption">Illustrative photography</span>
      </section>
      <div className="hero-footnote wrap">
        <span>For growing teams.</span>
        <span>For new beginnings.</span>
        <span>
          For the right connection.
          <span className="red-dot" />
        </span>
      </div>
      <section className="section wrap" aria-labelledby="services-heading">
        <div className="section-heading section-heading-split">
          <div>
            <p className="eyebrow">A more personal approach</p>
            <h2 id="services-heading">
              The right support.
              <br />
              For your next move<span className="accent-dot">.</span>
            </h2>
          </div>
          <p className="section-description">
            Behind every vacancy is a business moving forward. Behind every CV
            is a person ready for what’s next. We bring the two together.
          </p>
        </div>
        <Reveal className="services-grid">
          {services.map(
            ({ number, icon: Icon, title, text, label, href, category }) => (
              <article className="service-card" key={number}>
                <div className="service-card-top">
                  <Icon size={32} weight="light" aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <p className="service-category">{category}</p>
                <h3>{title}</h3>
                <p className="service-copy">{text}</p>
                <Link className="card-link" href={href}>
                  {label}
                  <ArrowUpRightIcon size={20} aria-hidden="true" />
                </Link>
              </article>
            ),
          )}
        </Reveal>
      </section>
      <section className="statement-section" aria-label="Our approach">
        <div className="statement-inner wrap">
          <span className="statement-symbol" aria-hidden="true">
            ↗
          </span>
          <AnimatedHeading className="statement-title">
            Behind every role, there’s a person.
          </AnimatedHeading>
          <p>That’s where we start.</p>
        </div>
      </section>
      <section
        className="section wrap coverage-section"
        aria-labelledby="coverage-heading"
      >
        <div className="coverage-intro">
          <p className="eyebrow">Our reach</p>
          <h2 id="coverage-heading">
            Rooted in Dubai.
            <br />
            Here for the UAE<span className="accent-dot">.</span>
          </h2>
          <p>
            From one new team member to your next hiring requirement, tell us
            the role and location. We’ll take the conversation from there.
          </p>
          <Link href="/contact" className="inline-link">
            Let’s talk <ArrowUpRightIcon size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="coverage-panel">
          <div className="coverage-panel-top">
            <MapPinIcon size={32} weight="light" aria-hidden="true" />
            <span>
              One country.
              <br />
              More possibilities.
            </span>
          </div>
          <p className="coverage-label">Recruitment across all emirates</p>
          <ul className="emirates-list">
            {emirates.map((emirate) => (
              <li key={emirate}>{emirate}</li>
            ))}
          </ul>
          <div className="coverage-bottom">
            <span>United Arab Emirates</span>
            <span className="red-dot" />
          </div>
        </div>
      </section>
      <section className="process-section" aria-labelledby="process-heading">
        <div className="section wrap">
          <div className="section-heading section-heading-split">
            <div>
              <p className="eyebrow">Simple steps. Real conversations.</p>
              <h2 id="process-heading">
                A clear path forward<span className="accent-dot">.</span>
              </h2>
            </div>
            <Link href="/about" className="inline-link">
              Get to know Sankhala{" "}
              <ArrowUpRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <ol className="process-grid">
            {steps.map(([title, description], i) => (
              <li key={title}>
                <div className="step-top">
                  <span>0{i + 1}</span>
                  {i !== 2 && (
                    <ArrowRightIcon
                      size={24}
                      weight="light"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        className="section wrap opportunities-section"
        aria-labelledby="opportunities-heading"
      >
        <div>
          <p className="eyebrow">Your next chapter</p>
          <h2 id="opportunities-heading">
            Good things
            <br />
            start with a hello<span className="accent-dot">.</span>
          </h2>
          <p className="section-description">
            Looking for your next role? Introduce yourself.
            <br />
            We’d like to know where you want to go.
          </p>
        </div>
        <div className="opportunity-card">
          <div className="opportunity-card-top">
            <BriefcaseIcon size={28} weight="light" aria-hidden="true" />
            <span className="chip">Career opportunities</span>
          </div>
          <h3>
            Your next role could be
            <br />
            just a conversation away.
          </h3>
          <p>
            New vacancies will appear here when they’re published. In the
            meantime, share your CV with our team.
          </p>
          <div className="opportunity-actions">
            <Link href="/submit-cv" className="button button-primary">
              Submit your CV <ArrowUpRightIcon size={20} aria-hidden="true" />
            </Link>
            <Link href="/jobs" className="inline-link">
              View opportunities <ArrowRightIcon size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="section wrap faq-section"
        aria-labelledby="faq-heading"
      >
        <div>
          <p className="eyebrow">A little clarity</p>
          <h2 id="faq-heading">
            Before your
            <br />
            next step<span className="accent-dot">.</span>
          </h2>
          <Link href="/contact" className="inline-link">
            Ask us something else{" "}
            <ArrowUpRightIcon size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <PlusIcon size={20} aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section
        className="contact-banner wrap"
        aria-labelledby="contact-heading"
      >
        <div>
          <p className="eyebrow">Let’s start a conversation</p>
          <h2 id="contact-heading">
            Your next move.
            <br />
            Our next conversation<span className="accent-dot">.</span>
          </h2>
        </div>
        <Link href="/contact" className="button button-primary">
          Get in touch <ArrowUpRightIcon size={22} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
