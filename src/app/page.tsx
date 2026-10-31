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
import { OrganizationData } from "@/components/organization-data";
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
    title: "Staff recruitment.",
    text: "Tell us who you need. Our team reviews your requirements and helps you find suitable candidates.",
    label: "Hire talent",
    href: "/hire-talent",
    category: "For employers",
  },
  {
    number: "02",
    icon: BriefcaseIcon,
    title: "Job opportunities.",
    text: "Explore available roles and find a new opportunity to put your experience to work.",
    label: "Explore opportunities",
    href: "/jobs",
    category: "For job seekers",
  },
  {
    number: "03",
    icon: FileTextIcon,
    title: "General CV submission.",
    text: "No suitable vacancy yet? Share your CV and tell our team what you would like to do next.",
    label: "Submit your CV",
    href: "/submit-cv",
    category: "For your next step",
  },
];
const journeys = [
  {
    audience: "For companies",
    title: "Build your team.",
    icon: UsersThreeIcon,
    href: "/hire-talent",
    action: "Share a requirement",
    steps: [
      [
        "Tell us who you need",
        "Share the role, number of staff and work location.",
      ],
      [
        "Review suitable candidates",
        "Our team reviews profiles and prepares a shortlist for your requirement.",
      ],
      [
        "Meet your next hire",
        "We coordinate interviews and follow the hiring process with you.",
      ],
    ],
  },
  {
    audience: "For job seekers",
    title: "Put your experience forward.",
    icon: BriefcaseIcon,
    href: "/submit-cv",
    action: "Submit your CV",
    steps: [
      [
        "Introduce yourself",
        "Share your CV, experience and the type of role you’re looking for.",
      ],
      [
        "Let our team review",
        "We review your profile against the requirements we receive.",
      ],
      [
        "Discuss a suitable role",
        "When there’s a potential fit, our team contacts you about the opportunity.",
      ],
    ],
  },
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
  [
    "What should I include in a staffing inquiry?",
    "Include the job role, number of staff, emirate, work location and your contact details. Add any skills or experience the role needs so our team can understand your requirement.",
  ],
  [
    "Which CV files can I choose?",
    "The form preview accepts PDF or DOCX files up to 5 MB. Online uploads are not open yet, so your selected file stays on your device. You can email your CV to our team in the meantime.",
  ],
];

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <OrganizationData />
      <section className="hero wrap" aria-labelledby="hero-heading">
        <div className="hero-media">
          <Image
            src="/images/recruitment-hero.webp"
            alt="An illustrative scene of professionals collaborating in a contemporary office"
            fill
            preload
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1344px) calc(100vw - 64px), 1280px"
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
            Recruitment support for companies and job seekers across Dubai and
            the UAE.
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
        <span>Dubai and all seven emirates.</span>
        <span>Companies and job seekers.</span>
        <a href="#how-it-works">
          See how it works <ArrowDownRightIcon size={16} aria-hidden="true" />
        </a>
      </div>
      <section className="section wrap" aria-labelledby="services-heading">
        <div className="section-heading section-heading-split">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 id="services-heading">
              Recruitment support.
              <br />
              Built around people<span className="accent-dot">.</span>
            </h2>
          </div>
          <p className="section-description">
            Share a staffing requirement, explore available roles or introduce
            yourself with a CV. Our team takes the conversation from there.
          </p>
        </div>
        <Reveal className="services-grid" stagger>
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
      <section
        id="how-it-works"
        className="process-section"
        aria-labelledby="process-heading"
      >
        <div className="section wrap">
          <div className="section-heading section-heading-split">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 id="process-heading">
                Two paths. A personal approach
                <span className="accent-dot">.</span>
              </h2>
            </div>
            <Link href="/about" className="inline-link">
              Get to know Sankhala{" "}
              <ArrowUpRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className="journeys-grid">
            {journeys.map(
              ({ audience, title, icon: Icon, steps, href, action }) => (
                <article className="journey-card" key={audience}>
                  <div className="journey-top">
                    <p className="eyebrow">{audience}</p>
                    <Icon size={28} weight="light" aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <ol className="journey-steps">
                    {steps.map(([label, description], index) => (
                      <li key={label}>
                        <span className="journey-number" aria-hidden="true">
                          0{index + 1}
                        </span>
                        <div>
                          <h4>{label}</h4>
                          <p>{description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <Link className="inline-link" href={href}>
                    {action}
                    <ArrowUpRightIcon size={18} aria-hidden="true" />
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>
      <section
        className="section wrap opportunities-section"
        aria-labelledby="opportunities-heading"
      >
        <div>
          <p className="eyebrow">For candidates</p>
          <h2 id="opportunities-heading">
            Your experience.
            <br />
            Your next opportunity<span className="accent-dot">.</span>
          </h2>
          <p className="section-description">
            Let our team know the work you’re looking for, your experience and
            your preferred location.
          </p>
        </div>
        <div className="opportunity-card">
          <div className="opportunity-card-top">
            <BriefcaseIcon size={28} weight="light" aria-hidden="true" />
            <span className="chip">Career opportunities</span>
          </div>
          <h3>No suitable vacancy yet?</h3>
          <p>
            Published jobs will appear on our careers page. You can still
            introduce yourself by emailing your CV to our recruitment team.
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
          <p className="eyebrow">Common questions</p>
          <h2 id="faq-heading">
            Before you get in touch<span className="accent-dot">.</span>
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
            Hiring or looking for work?
            <br />
            Let’s talk<span className="accent-dot">.</span>
          </h2>
        </div>
        <Link href="/contact" className="button button-primary">
          Contact our team <ArrowUpRightIcon size={22} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
