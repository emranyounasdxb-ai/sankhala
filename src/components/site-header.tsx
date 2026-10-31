"use client";

import { ArrowUpRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/jobs", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstMobileLink = useRef<HTMLAnchorElement>(null);
  const scrollSentinel = useRef<HTMLSpanElement>(null);
  const bodyOverflow = useRef("");
  const scrollLocked = useRef(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const unlockScroll = useCallback(() => {
    if (scrollLocked.current) {
      document.body.style.overflow = bodyOverflow.current;
      scrollLocked.current = false;
    }
  }, []);

  const closeMenu = useCallback(() => {
    dialog.current?.close();
  }, []);

  useEffect(() => {
    if (pathname) closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => () => unlockScroll(), [unlockScroll]);

  useEffect(() => {
    const sentinel = scrollSentinel.current;
    if (!sentinel || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const onResize = () => {
      if (desktop.matches) closeMenu();
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [closeMenu]);

  function openMenu() {
    if (!dialog.current || dialog.current.open) return;
    bodyOverflow.current = document.body.style.overflow;
    scrollLocked.current = true;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
    setOpen(true);
    firstMobileLink.current?.focus();
  }

  function onClose() {
    setOpen(false);
    unlockScroll();
    if (menuButton.current?.offsetParent)
      menuButton.current.focus({ preventScroll: true });
  }

  function active(href: string) {
    return (
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
    );
  }

  return (
    <>
      <span
        ref={scrollSentinel}
        className="header-scroll-sentinel"
        aria-hidden="true"
      />
      <header
        className={`site-header polished-header${scrolled ? " is-scrolled" : ""}`}
      >
        <div className="header-inner">
          <Link
            href="/"
            className="header-brand"
            aria-label="Sankhala Employment home"
          >
            <BrandLogo />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${active(href) ? " is-active" : ""}`}
                aria-current={active(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <Link
              href="/hire-talent"
              className="button button-primary header-cta"
            >
              Hire Talent <ArrowUpRightIcon size={18} aria-hidden="true" />
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label="Open navigation menu"
              onClick={openMenu}
            >
              <span className="menu-glyph" aria-hidden="true">
                <ListIcon size={24} className="menu-glyph-list" />
                <XIcon size={24} className="menu-glyph-close" />
              </span>
            </button>
          </div>
        </div>

        <noscript>
          <nav className="fallback-nav" aria-label="Page navigation">
            {navigation.map(({ href, label }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </noscript>
        <dialog
          ref={dialog}
          id="mobile-navigation"
          className="mobile-menu"
          aria-label="Navigation menu"
          onClose={onClose}
        >
          <div className="mobile-menu-inner">
            <div className="mobile-menu-header">
              <Link
                href="/"
                onClick={closeMenu}
                aria-label="Sankhala Employment home"
              >
                <BrandLogo />
              </Link>
              <div className="header-actions">
                <ThemeToggle />
                <button
                  type="button"
                  className="menu-toggle mobile-menu-close"
                  aria-label="Close navigation menu"
                  onClick={closeMenu}
                >
                  <XIcon size={24} aria-hidden="true" />
                </button>
              </div>
            </div>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navigation.map(({ href, label }, index) => (
                <Link
                  key={href}
                  ref={index === 0 ? firstMobileLink : undefined}
                  href={href}
                  onClick={closeMenu}
                  className={`mobile-nav-link${active(href) ? " is-active" : ""}`}
                  aria-current={active(href) ? "page" : undefined}
                >
                  <span className="mobile-nav-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  {label}
                  <ArrowUpRightIcon size={24} aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <div className="mobile-menu-actions">
              <Link
                href="/hire-talent"
                className="button button-primary"
                onClick={closeMenu}
              >
                Hire Talent <ArrowUpRightIcon size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/jobs"
                className="button button-secondary"
                onClick={closeMenu}
              >
                Find a Job <ArrowUpRightIcon size={18} aria-hidden="true" />
              </Link>
            </div>
            <Link
              href="/submit-cv"
              className="mobile-cv-link"
              onClick={closeMenu}
            >
              Submit your CV <ArrowUpRightIcon size={18} aria-hidden="true" />
            </Link>
            <p className="mobile-menu-note">Dubai. Across the UAE.</p>
          </div>
        </dialog>
      </header>
    </>
  );
}
