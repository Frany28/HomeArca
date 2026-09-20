import { useEffect, useState } from "react";
import clsx from "clsx";
import MainLogo from "../../../assets/logos/MainLogo.jsx";
import Button from "../Button/Button.jsx";
import HorizontalTabMenu from "../HorizontalTabMenu/HorizontalTabMenu.jsx";
import Input from "../Input/Input.jsx";
import TabItem from "../TabItem/TabItem.jsx";

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

function InstagramIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3.33333"
        y="3.33333"
        width="13.3333"
        height="13.3333"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 9.58333C12.5 10.964 11.3807 12.0833 10 12.0833C8.61929 12.0833 7.5 10.964 7.5 9.58333C7.5 8.20262 8.61929 7.08333 10 7.08333C11.3807 7.08333 12.5 8.20262 12.5 9.58333Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M13.75 6.25H13.7583"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.6667 7.75V10.1667H13.8333C14 10.1667 14.0833 10.3333 14.0833 10.5L13.75 12.0833C13.75 12.1667 13.5833 12.25 13.5 12.25H11.6667V18.3333H9.16667V12.3333H7.75C7.58333 12.3333 7.5 12.25 7.5 12.0833V10.5C7.5 10.3333 7.58333 10.25 7.75 10.25H9.16667V7.5C9.16667 6.08333 10.25 5 11.6667 5H13.9167C14.0833 5 14.1667 5.08333 14.1667 5.25V7.25C14.1667 7.41667 14.0833 7.5 13.9167 7.5H11.9167C11.75 7.5 11.6667 7.58333 11.6667 7.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M12.4998 18.3327H7.49984C3.33317 18.3327 1.6665 16.666 1.6665 12.4993V7.49935C1.6665 3.33268 3.33317 1.66602 7.49984 1.66602H12.4998C16.6665 1.66602 18.3332 3.33268 18.3332 7.49935V12.4993C18.3332 16.666 16.6665 18.3327 12.4998 18.3327Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TiktokIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18.3332 6.29565V13.7031C18.3332 14.9309 17.8454 16.1085 16.9772 16.9767C16.109 17.8449 14.9314 18.3327 13.7035 18.3327H6.29613C5.06828 18.3327 3.89071 17.8449 3.02249 16.9767C2.15427 16.1085 1.6665 14.9309 1.6665 13.7031V6.29565C1.6665 5.06779 2.15427 3.89023 3.02249 3.022C3.89071 2.15378 5.06828 1.66602 6.29613 1.66602H13.7035C14.9314 1.66602 16.109 2.15378 16.9772 3.022C17.8454 3.89023 18.3332 5.06779 18.3332 6.29565Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33301 10C7.83856 10 7.35521 10.1466 6.94408 10.4213C6.53296 10.696 6.21253 11.0865 6.02331 11.5433C5.83409 12.0001 5.78458 12.5028 5.88105 12.9877C5.97751 13.4727 6.21561 13.9181 6.56524 14.2678C6.91487 14.6174 7.36033 14.8555 7.84528 14.952C8.33024 15.0484 8.8329 14.9989 9.28972 14.8097C9.74653 14.6205 10.137 14.3 10.4117 13.8889C10.6864 13.4778 10.833 12.9945 10.833 12.5V5C11.1105 5.83333 12.1663 7.5 14.1663 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsappIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#footer-whatsapp-clip)">
        <mask
          id="footer-whatsapp-mask"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="20"
          height="20"
        >
          <path d="M20 0H0V20H20V0Z" fill="white" />
        </mask>
        <g mask="url(#footer-whatsapp-mask)">
          <path
            d="M1.66678 18.9582C1.50011 18.9582 1.34176 18.8915 1.22509 18.7748C1.06676 18.6165 1.00013 18.3832 1.05846 18.1665L2.10847 14.2415C1.40847 12.9415 1.04178 11.4748 1.04178 9.99151C1.04178 5.04987 5.05845 1.0332 10.0001 1.0332C14.9417 1.0332 18.9584 5.04987 18.9584 9.99151C18.9584 14.9332 14.9417 18.9498 10.0001 18.9498C8.49175 18.9498 7.01681 18.5748 5.70014 17.8582L1.83346 18.9332C1.77512 18.9498 1.72511 18.9582 1.66678 18.9582ZM5.78345 16.5665C5.89178 16.5665 6.00012 16.5999 6.10012 16.6499C7.27512 17.3416 8.62508 17.7082 10.0001 17.7082C14.2501 17.7082 17.7084 14.2498 17.7084 9.99985C17.7084 5.74988 14.2501 2.29154 10.0001 2.29154C5.75012 2.29154 2.29178 5.74988 2.29178 9.99985C2.29178 11.3582 2.65011 12.6832 3.32511 13.8498C3.40844 13.9915 3.43346 14.1665 3.39179 14.3248L2.55846 17.4415L5.62511 16.5915C5.67512 16.5748 5.73345 16.5665 5.78345 16.5665Z"
            fill="currentColor"
          />
          <path
            d="M12.2835 14.8009C11.7669 14.8009 11.2335 14.6842 10.6752 14.4426C10.1502 14.2176 9.6252 13.9176 9.11687 13.5426C8.61687 13.1759 8.12522 12.7592 7.67522 12.3092C7.22522 11.8509 6.80852 11.3676 6.44185 10.8676C6.06685 10.3426 5.76684 9.8259 5.55018 9.31757C5.31684 8.76757 5.2002 8.22589 5.2002 7.70923C5.2002 7.34256 5.26685 6.99256 5.39185 6.66756C5.52518 6.32589 5.74185 6.01755 6.02519 5.75088C6.55852 5.22588 7.32522 5.03423 7.93355 5.3259C8.14189 5.41757 8.31688 5.56757 8.4502 5.76757L9.41687 7.12588C9.51687 7.25921 9.59187 7.40088 9.6502 7.54254C9.71687 7.70921 9.75854 7.8759 9.75854 8.03423C9.75854 8.2509 9.7002 8.46757 9.58354 8.65923C9.50854 8.78423 9.4002 8.93423 9.25854 9.0759L9.1502 9.19257C9.2002 9.25923 9.25854 9.34257 9.3502 9.44257C9.5252 9.64257 9.71687 9.85923 9.9252 10.0676C10.1335 10.2676 10.3419 10.4676 10.5502 10.6426C10.6502 10.7259 10.7335 10.7926 10.8002 10.8342L10.9169 10.7176C11.0669 10.5676 11.2169 10.4509 11.3669 10.3759C11.6419 10.2009 12.0669 10.1592 12.4419 10.3176C12.5752 10.3676 12.7085 10.4426 12.8502 10.5426L14.2419 11.5259C14.4335 11.6592 14.5835 11.8426 14.6835 12.0509C14.7669 12.2592 14.8002 12.4426 14.8002 12.6342C14.8002 12.8842 14.7419 13.1259 14.6335 13.3592C14.5252 13.5759 14.4002 13.7676 14.2502 13.9426C13.9835 14.2342 13.6752 14.4509 13.3419 14.5926C13.0085 14.7342 12.6502 14.8009 12.2835 14.8009ZM7.32519 6.45088C7.27519 6.45088 7.10856 6.45088 6.90023 6.65922C6.7419 6.80922 6.63354 6.96756 6.55854 7.14256C6.48354 7.31756 6.4502 7.51757 6.4502 7.71757C6.4502 8.06757 6.53352 8.44257 6.70019 8.84257C6.87519 9.25923 7.13354 9.7009 7.4502 10.1426C7.7752 10.5842 8.14188 11.0259 8.5502 11.4342C8.95854 11.8342 9.39187 12.2092 9.84187 12.5426C10.2752 12.8592 10.7169 13.1092 11.1585 13.3009C11.7919 13.5759 12.3752 13.6426 12.8502 13.4426C13.0169 13.3759 13.1669 13.2592 13.3169 13.1092C13.3919 13.0259 13.4502 12.9426 13.5002 12.8342C13.5252 12.7759 13.5419 12.7092 13.5419 12.6509C13.5419 12.6342 13.5419 12.6092 13.5169 12.5592L12.1252 11.5926C12.0669 11.5509 12.0085 11.5176 11.9585 11.5009C11.9252 11.5176 11.8752 11.5426 11.7835 11.6342L11.4669 11.9509C11.2252 12.1926 10.8419 12.2592 10.5335 12.1509L10.3835 12.0842C10.1919 11.9842 9.9752 11.8342 9.73354 11.6259C9.5002 11.4259 9.2752 11.2176 9.03354 10.9842C8.8002 10.7426 8.59187 10.5176 8.39187 10.2842C8.17521 10.0259 8.02521 9.81757 7.92521 9.64257L7.83355 9.4259C7.80855 9.34257 7.8002 9.2509 7.8002 9.16757C7.8002 8.93424 7.88355 8.7259 8.04189 8.55923L8.35854 8.23423C8.4502 8.14256 8.48354 8.09257 8.5002 8.05923C8.4752 8.0009 8.44187 7.95089 8.4002 7.89256L7.42518 6.51756L7.32519 6.45088Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="footer-whatsapp-clip">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function GoogleIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17.0833 10.2083C17.0833 9.65205 17.0335 9.12123 16.9417 8.61108H10V11.4583H13.9667C13.7958 12.3812 13.2708 13.1625 12.4792 13.6896V15.5375H14.8542C16.2458 14.2562 17.0833 12.3687 17.0833 10.2083Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 17.0833C11.9875 17.0833 13.6542 16.425 14.8542 15.5375L12.4792 13.6896C11.8208 14.1312 10.9792 14.3958 10 14.3958C8.08333 14.3958 6.45833 13.1021 5.87917 11.3625H3.425V13.2708C4.61667 15.6375 7.06667 17.0833 10 17.0833Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.87924 11.3625C5.7334 10.9208 5.65007 10.45 5.65007 9.95833C5.65007 9.46667 5.7334 8.99583 5.87924 8.55417V6.64584H3.42507C2.9334 7.625 2.65007 8.72917 2.65007 9.95833C2.65007 11.1875 2.9334 12.2917 3.42507 13.2708L5.87924 11.3625Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.52082C11.0708 5.52082 12.0333 5.88957 12.7917 6.61457L14.9083 4.4979C13.65 3.32707 11.9833 2.60416 10 2.60416C7.06667 2.60416 4.61667 4.04999 3.425 6.64582L5.87917 8.55415C6.45833 6.81457 8.08333 5.52082 10 5.52082Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getSocialIcon(type) {
  if (type === "instagram") {
    return <InstagramIcon className="size-5" />;
  }

  if (type === "facebook") {
    return <FacebookIcon className="size-5" />;
  }

  if (type === "tiktok") {
    return <TiktokIcon className="size-5" />;
  }

  if (type === "whatsapp") {
    return <WhatsappIcon className="size-5" />;
  }

  return <GoogleIcon className="size-5" />;
}

function PublicCtaFooter({
  ariaLabel,
  className,
  copyrightText,
  navItems,
  onNavChange,
  onSocialClick,
  resolvedActiveNavIndex,
  socialItems,
  title,
  ...props
}) {
  const navigationClassName =
    "[&_button]:text-[var(--color-primary-500)] [&_button:hover]:text-[var(--color-neutral-100-uniform)]";

  return (
    <footer
      className={clsx(
        "dark flex w-full flex-col items-start gap-[24px]",
        className,
      )}
      aria-label={ariaLabel}
      data-node-id="5142:15337"
      {...props}
    >
      <div className="w-full px-[var(--spacing-gap-7)] pt-[24px] max-[767px]:px-0">
        <div className="w-full border-b border-[var(--color-neutral-200)] py-[24px]">
          <h2 className="text-heading-4 m-0 text-[var(--color-neutral-100-uniform)]">
            {title}
          </h2>
        </div>
      </div>

      <div className="w-full px-[var(--spacing-gap-7)] max-[767px]:px-0">
        <div className="flex w-full flex-col items-center gap-[24px] min-[1200px]:flex-row min-[1200px]:justify-between">
          <MainLogo
            size="32px"
            appearance="dark"
            alt="ARCA Studio"
            className="h-[32px] w-[152px] shrink-0 justify-start"
          />

          <HorizontalTabMenu
            items={navItems}
            activeIndex={resolvedActiveNavIndex}
            interactive
            onChange={onNavChange}
            filled="off"
            style="Brand"
            orientation="horizontal"
            className={clsx(
              "hidden min-[1200px]:inline-flex",
              navigationClassName,
            )}
            aria-label="Navegación del footer"
          />

          <HorizontalTabMenu
            items={navItems}
            activeIndex={resolvedActiveNavIndex}
            interactive
            onChange={onNavChange}
            filled="off"
            style="Brand"
            orientation="vertical"
            className={clsx(
              "min-[1200px]:hidden",
              navigationClassName,
            )}
            aria-label="Navegación del footer"
          />

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-[var(--spacing-gap-2)]">
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
                onClick={() => onSocialClick?.(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-[var(--spacing-gap-7)] max-[767px]:px-0">
        <div className="flex w-full items-center justify-center border-t border-[var(--color-neutral-200)] py-[24px]">
          <p className="text-body-2 m-0 text-center text-[var(--color-text-100)]">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
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
    if (!isNavControlled) {
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
