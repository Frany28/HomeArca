import { useEffect, useState } from "react";
import clsx from "clsx";
import MainLogo from "../../../assets/logos/MainLogo.jsx";
import Button from "../Button/Button.jsx";
import HorizontalTabMenu from "../HorizontalTabMenu/HorizontalTabMenu.jsx";
import Input from "../Input/Input.jsx";
import TabItem from "../TabItem/TabItem.jsx";
import PublicCtaFooter, { getSocialIcon } from "./PublicCtaFooter.jsx";

const FOOTER_SECTION_NODE_IDS = {
  desktop: {
    light: "2061:24474",
  },
  mobile: {
    light: "2061:24483",
  },
};

const DEFAULT_NAV_ITEMS = [
  "Proyectos Destacados",
  "Sobre Nosotros",
  "Nuestro Procesos",
  "Contacto",
];

const DEFAULT_SOCIAL_ITEMS = [
  { id: "instagram", label: "Instagram", icon: "instagram" },
  { id: "facebook", label: "Facebook", icon: "facebook" },
  { id: "tiktok", label: "TikTok", icon: "tiktok" },
  { id: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { id: "google", label: "Google", icon: "google" },
];

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains("dark");
}

function clearPointerFocus(event) {
  event.currentTarget.blur();
}

function InfoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 6.66667V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.99542 13.3333H10.0029"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterSection({
  className,
  title = "Descubre nuevos proyectos y actualizaciones de nuestro estudio",
  emailPlaceholder = "Ingresa tu correo electrónico",
  buttonLabel = "Suscribirse",
  hintText = "Tu correo electrónico está seguro con nosotros.",
  navItems = DEFAULT_NAV_ITEMS,
  activeNavIndex = -1,
  defaultActiveNavIndex = -1,
  socialItems = DEFAULT_SOCIAL_ITEMS,
  copyrightText = "© 2026 ARCA Studio. Todos los derechos reservados.",
  variant = "desktop",
  presentation = "default",
  logo = null,
  onSubscribeClick,
  onInputChange,
  onNavChange,
  onSocialClick,
  inputValue,
  "aria-label": ariaLabel = "Footer section",
  ...props
}) {
  const [isDarkMode, setIsDarkMode] = useState(getDocumentDarkMode);
  const [internalValue, setInternalValue] = useState("");
  const [internalActiveNavIndex, setInternalActiveNavIndex] = useState(
    Number.isInteger(defaultActiveNavIndex) ? defaultActiveNavIndex : -1,
  );
  const isControlled = inputValue !== undefined;
  const resolvedValue = isControlled ? inputValue : internalValue;
  const isNavControlled = Number.isInteger(activeNavIndex) && activeNavIndex >= 0;
  const resolvedActiveNavIndex = isNavControlled
    ? activeNavIndex
    : internalActiveNavIndex;
  const resolvedVariant = variant === "mobile" ? "mobile" : "desktop";
  const isMobile = resolvedVariant === "mobile";

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkMode(getDocumentDarkMode());
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onInputChange?.(event);
  };

  const handleNavChange = (index) => {
    if (!isNavControlled && presentation !== "publicCta") {
      setInternalActiveNavIndex(index);
    }

    onNavChange?.(index);
  };

  const nodeId = isDarkMode
    ? undefined
    : FOOTER_SECTION_NODE_IDS[resolvedVariant].light;

  if (presentation === "publicCta") {
    return (
      <PublicCtaFooter
        ariaLabel={ariaLabel}
        className={className}
        copyrightText={copyrightText}
        navItems={navItems}
        onNavChange={handleNavChange}
        onSocialClick={onSocialClick}
        resolvedActiveNavIndex={resolvedActiveNavIndex}
        socialItems={socialItems}
        title={title}
        {...props}
      />
    );
  }

  return (
    <section
      className={clsx(
        "flex w-full flex-col items-start",
        isMobile ? "px-[16px] pb-[20px]" : "px-[20px] pb-[25px]",
        className,
      )}
      aria-label={ariaLabel}
      data-node-id={nodeId}
      {...props}
    >
      <div
        className={clsx(
          "flex w-full flex-col border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-300)]",
          isMobile ? "gap-[20px] py-[20px]" : "gap-[24px] py-[24px]",
        )}
      >
        <div
          className={clsx(
            "flex w-full",
            isMobile
              ? "flex-col items-start gap-[20px]"
              : "flex-col items-start gap-[24px] lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <h2
              className={clsx(
                "text-[var(--color-text-300)]",
                isMobile
                  ? "max-w-[280px] text-heading-5"
                  : "max-w-[520px] text-heading-4",
              )}
            >
              {title}
            </h2>
          </div>

          <div
            className={clsx(
              "flex w-full flex-col items-start gap-[8px]",
              isMobile ? "max-w-none" : "max-w-[474px]",
            )}
          >
            {isMobile ? (
              <>
                <Input
                  type="Default input"
                  size="L"
                  value={resolvedValue}
                  onChange={handleInputChange}
                  placeholder={emailPlaceholder}
                  showLabel={false}
                  showHint={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  className="max-w-none w-full"
                  aria-label="Correo electrónico"
                />
                <div className="flex items-center gap-[4px] text-[var(--color-text-100)] dark:text-[var(--color-text-200)]">
                  <InfoIcon className="size-4 shrink-0" />
                  <span className="text-body-4">{hintText}</span>
                </div>
                <Button
                  theme="Primary"
                  type="Solid"
                  size="M"
                  fitContent={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  onClick={onSubscribeClick}
                  className="w-full"
                >
                  {buttonLabel}
                </Button>
              </>
            ) : (
              <>
                <div className="flex w-full items-start gap-[8px]">
                  <Input
                    type="Default input"
                    size="L"
                    value={resolvedValue}
                    onChange={handleInputChange}
                    placeholder={emailPlaceholder}
                    showLabel={false}
                    showHint={false}
                    showLeftIcon={false}
                    showRightIcon={false}
                    className="max-w-none w-full"
                    aria-label="Correo electrónico"
                  />
                  <Button
                    theme="Primary"
                    type="Solid"
                    size="M"
                    fitContent
                    showLeftIcon={false}
                    showRightIcon={false}
                    onClick={onSubscribeClick}
                  >
                    {buttonLabel}
                  </Button>
                </div>
                <div className="flex items-center gap-[4px] text-[var(--color-text-100)] dark:text-[var(--color-text-200)]">
                  <InfoIcon className="size-4 shrink-0" />
                  <span className="text-body-4">{hintText}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "flex w-full flex-col border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-300)]",
          isMobile
            ? "gap-[16px] py-[20px]"
            : "gap-[20px] py-[24px] lg:flex-row lg:items-center lg:justify-between",
        )}
      >
        <div
          className={clsx(
            "flex shrink-0 items-center",
            isMobile && "w-full justify-center",
          )}
        >
          {logo ?? <MainLogo size="32px" alt="ARCA Studio" />}
        </div>

        <div
          className={clsx(
            "flex min-w-0 flex-1",
            isMobile ? "w-full justify-center" : "justify-start lg:justify-center",
          )}
        >
          {isMobile ? (
            <div
              className="flex w-full flex-col items-center justify-center gap-[8px]"
              data-node-id="2056:24023"
              aria-label="Footer navigation"
            >
              {navItems.map((item, index) => (
                <TabItem
                  key={`${item}-${index}`}
                  label={item}
                  size="S"
                  style="Brand"
                  selected={resolvedActiveNavIndex === index}
                  persistSelection={false}
                  interactive
                  iconLeft={false}
                  iconRight={false}
                  onClick={() => handleNavChange(index)}
                  onMouseUp={clearPointerFocus}
                  onTouchEnd={clearPointerFocus}
                  aria-label={item}
                />
              ))}
            </div>
          ) : (
            <HorizontalTabMenu
              items={navItems}
              activeIndex={resolvedActiveNavIndex}
              interactive
              onChange={handleNavChange}
              filled="off"
              style="Brand"
              orientation="horizontal"
              className="max-w-full"
              aria-label="Footer navigation"
            />
          )}
        </div>

        <div
          className={clsx(
            "flex shrink-0 flex-wrap items-center gap-[4px]",
            isMobile && "w-full justify-center",
          )}
        >
          {socialItems.map((item) => (
            <Button
              key={item.id}
              theme="Primary"
              type="Ghost"
              size="S"
              showText={false}
              showLeftIcon
              showRightIcon={false}
              iconLeft={getSocialIcon(item.icon)}
              aria-label={item.label}
              href={item.href}
              target={item.href ? "_blank" : undefined}
              rel={item.href ? "noopener noreferrer" : undefined}
              onClick={() => onSocialClick?.(item)}
            />
          ))}
        </div>
      </div>

      <div
        className={clsx(
          "flex w-full py-[20px]",
          isMobile
            ? "justify-center"
            : "justify-center md:flex-row md:items-center md:justify-between",
        )}
      >
        <p className="text-center text-body-2 text-[var(--color-text-100)] dark:text-[var(--color-text-200)]">
          {copyrightText}
        </p>
      </div>
    </section>
  );
}

export default FooterSection;
