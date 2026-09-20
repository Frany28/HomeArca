import { useEffect, useState } from "react";
import clsx from "clsx";

import logo20 from "./LOGO=20px (1).svg";
import logo20Raw from "./LOGO=20px (1).svg?raw";
import logo24 from "./LOGO=24px (1).svg";
import logo24Raw from "./LOGO=24px (1).svg?raw";
import logo32 from "./LOGO=32px (1).svg";
import logo32Raw from "./LOGO=32px (1).svg?raw";
import logo48 from "./LOGO=48px (1).svg";
import logo48Raw from "./LOGO=48px (1).svg?raw";
import logo64 from "./LOGO 64px.svg";
import logo64Raw from "./LOGO 64px.svg?raw";
import logo200 from "./LOGO 200px.svg";
import logo200Raw from "./LOGO 200px.svg?raw";

const APPEARANCES = new Set(["auto", "light", "dark"]);

function createDarkLogoSource(svg) {
  const darkSvg = svg.replaceAll("#2A2929", "#FFFFFF");

  return `data:image/svg+xml,${encodeURIComponent(darkSvg)}`;
}

const LOGO_MAP = {
  light: {
    "20px": logo20,
    "24px": logo24,
    "32px": logo32,
    "48px": logo48,
    "64px": logo64,
    "200px": logo200,
  },
  dark: {
    "20px": createDarkLogoSource(logo20Raw),
    "24px": createDarkLogoSource(logo24Raw),
    "32px": createDarkLogoSource(logo32Raw),
    "48px": createDarkLogoSource(logo48Raw),
    "64px": createDarkLogoSource(logo64Raw),
    "200px": createDarkLogoSource(logo200Raw),
  },
};

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
}

function MainLogo({
  size = "32px",
  appearance = "auto",
  alt = "Main logo",
  className,
  imgClassName,
  ...props
}) {
  const [isDarkMode, setIsDarkMode] = useState(getDocumentDarkMode);
  const resolvedSize = LOGO_MAP.light[size] ? size : "32px";
  const resolvedAppearance = APPEARANCES.has(appearance) ? appearance : "auto";
  const useDarkLogo =
    resolvedAppearance === "dark" ||
    (resolvedAppearance === "auto" && isDarkMode);
  const logoSrc = useDarkLogo
    ? LOGO_MAP.dark[resolvedSize]
    : LOGO_MAP.light[resolvedSize];

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;

    const observer = new MutationObserver(() => {
      setIsDarkMode(getDocumentDarkMode());
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (body) {
      observer.observe(body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={clsx("inline-flex items-center justify-center", className)}
      {...props}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={clsx("block w-auto object-contain", imgClassName)}
        style={{ height: resolvedSize }}
      />
    </div>
  );
}

export default MainLogo;
