import Image from "next/image";

export function BrandLogo({
  inverse = false,
  className = "",
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`brand-logo${inverse ? " brand-logo-inverse" : ""} ${className}`}
    >
      {!inverse && (
        <Image
          src="/brand/logos/logo-on-light-400.webp"
          alt="Sankhala Employment"
          width={400}
          height={179}
          sizes="(max-width: 767px) 135px, 150px"
          className="brand-logo-light"
        />
      )}
      <Image
        src="/brand/logos/logo-on-dark-400.webp"
        alt="Sankhala Employment"
        width={400}
        height={179}
        sizes={inverse ? "180px" : "(max-width: 767px) 135px, 150px"}
        className={inverse ? "brand-logo-white" : "brand-logo-dark"}
      />
    </span>
  );
}
