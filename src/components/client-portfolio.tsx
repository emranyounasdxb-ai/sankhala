import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { featuredClients, portfolioClients } from "@/lib/clients";

export function ClientPortfolio({ compact = false }: { compact?: boolean }) {
  const clients = compact ? featuredClients : portfolioClients;
  return (
    <section
      className={`company-clients${compact ? " company-clients-compact" : ""}`}
      aria-labelledby={
        compact ? "featured-clients-heading" : "client-list-heading"
      }
    >
      <svg
        className="company-logo-filters"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Recolour only dark ink for dark surfaces; retain source alpha and
              coloured artwork, including the coloured panels within a logo. */}
          <filter id="company-client-dark-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1"
              result="opaque-colours"
            />
            <feComponentTransfer in="opaque-colours" result="dark-channels">
              <feFuncR type="discrete" tableValues="1 0 0 0" />
              <feFuncG type="discrete" tableValues="1 0 0 0" />
              <feFuncB type="discrete" tableValues="1 1 0 0 0" />
            </feComponentTransfer>
            <feColorMatrix
              in="dark-channels"
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 1 1 0 -2"
              result="dark-mask"
            />
            <feComposite
              in="opaque-colours"
              in2="dark-mask"
              operator="out"
              result="coloured-ink"
            />
            <feFlood floodColor="#ffffff" result="light-ink" />
            <feComposite
              in="light-ink"
              in2="dark-mask"
              operator="in"
              result="recoloured-ink"
            />
            <feComposite
              in="recoloured-ink"
              in2="coloured-ink"
              operator="over"
              result="theme-colours"
            />
            <feComposite in="theme-colours" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="company-section-heading">
        <div>
          <p className="eyebrow">Our clients</p>
          <h2 id={compact ? "featured-clients-heading" : "client-list-heading"}>
            Businesses we support.
          </h2>
        </div>
        {compact ? (
          <Link className="inline-link" href="/clients">
            Meet our clients <ArrowUpRightIcon size={20} aria-hidden="true" />
          </Link>
        ) : (
          <p className="company-section-copy">
            Client relationships across retail, construction, hospitality and
            other industries, with staffing needs shaped around each business.
          </p>
        )}
      </div>
      <ul className="company-client-grid" aria-label="Sankhala clients">
        {clients.map(({ name, logo, width, height, darkVariant }) => (
          <li className="company-client-card" key={name}>
            {logo ? (
              <>
                <div className="company-client-artwork">
                  <Image
                    src={`/images/clients/${logo}.png`}
                    alt=""
                    width={width ?? 400}
                    height={height ?? 180}
                    unoptimized
                    className={
                      darkVariant === "monochrome"
                        ? "company-client-monochrome"
                        : undefined
                    }
                    style={{ maxWidth: width }}
                  />
                </div>
                <span className="company-client-name">{name}</span>
              </>
            ) : (
              <span className="company-client-wordmark">{name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
