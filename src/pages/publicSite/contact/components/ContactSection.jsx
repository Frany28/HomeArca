import { ArrowRight } from "iconsax-react";

import Button from "../../../../components/ui/Button/Button.jsx";
import PublicCtaFooter from "../../../../components/ui/FooterSection/PublicCtaFooter.jsx";
import {
  CONTACT_CONTENT,
  CONTACT_EXTERNAL_LINKS,
  CONTACT_NAVIGATION_ITEMS,
  CONTACT_SOCIAL_ITEMS,
} from "../contactContent.js";
import ContactTiltCard from "./ContactTiltCard.jsx";

function ContactSection({ onNavigate }) {
  const navigationLabels = CONTACT_NAVIGATION_ITEMS.map((item) => item.label);

  const handleFooterNavigation = (index) => {
    const destination = CONTACT_NAVIGATION_ITEMS[index]?.id;

    if (destination) onNavigate?.(destination);
  };

  return (
    <section
      id="contact"
      aria-label="Contacto"
      data-navbar-background="dark"
      data-node-id="4628:2294"
      className="dark flex w-full flex-col items-center gap-[var(--spacing-gap-7)] bg-[var(--color-primary-500-uniform)] px-[16px] py-[var(--spacing-gap-8)]"
    >
      <div
        className="grid w-full max-w-[1200px] grid-cols-[minmax(0,616px)_432px] items-center gap-[var(--spacing-gap-8)] p-[var(--spacing-gap-7)] max-[1199px]:grid-cols-[minmax(0,1fr)_minmax(320px,432px)] max-[1199px]:gap-[var(--spacing-gap-6)] max-[1023px]:grid-cols-1 max-[1023px]:gap-[var(--spacing-gap-7)] max-[767px]:p-0"
        data-node-id="4856:5058"
      >
        <div className="flex min-w-0 flex-col items-start gap-[var(--spacing-gap-7)]">
          <h2 className="text-heading-2 m-0 text-[var(--color-neutral-100-uniform)] max-[767px]:text-[40px] max-[767px]:leading-[48px] max-[767px]:tracking-[-1px]">
            {CONTACT_CONTENT.title}
          </h2>

          <p className="text-body-1 m-0 text-[var(--color-neutral-100-uniform)] opacity-60">
            {CONTACT_CONTENT.description}
          </p>

          <Button
            theme="Primary"
            type="Solid"
            size="L"
            fitContent
            showLeftIcon={false}
            showRightIcon
            href={CONTACT_EXTERNAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            iconRight={
              <ArrowRight
                size="20"
                variant="Linear"
                color="currentColor"
              />
            }
            className="rounded-[var(--radius-3)] max-[767px]:!h-[52px] max-[767px]:!w-full max-[767px]:max-w-[343px]"
          >
            {CONTACT_CONTENT.buttonLabel}
          </Button>
        </div>

        <ContactTiltCard />
      </div>

      <PublicCtaFooter
        title={CONTACT_CONTENT.footerTitle}
        navItems={navigationLabels}
        socialItems={CONTACT_SOCIAL_ITEMS}
        copyrightText={CONTACT_CONTENT.copyright}
        onNavChange={handleFooterNavigation}
        className="max-w-[1200px]"
      />
    </section>
  );
}

export default ContactSection;
