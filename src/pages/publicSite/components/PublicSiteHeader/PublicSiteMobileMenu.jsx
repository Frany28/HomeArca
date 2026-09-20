import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";

import Button from "../../../../components/ui/Button/Button.jsx";
import PublicSiteNavigationMenu from "./PublicSiteNavigationMenu.jsx";

const MENU_EASE = [0.22, 1, 0.36, 1];

const panelVariants = {
  closed: ({ reduceMotion }) => ({
    height: 0,
    opacity: 0,
    transition: {
      duration: reduceMotion ? 0.01 : 0.22,
      ease: MENU_EASE,
      when: "afterChildren",
    },
  }),
  open: ({ reduceMotion }) => ({
    height: 366,
    opacity: 1,
    transition: {
      duration: reduceMotion ? 0.01 : 0.3,
      ease: MENU_EASE,
      when: "beforeChildren",
    },
  }),
};

const listVariants = {
  closed: ({ reduceMotion }) => ({
    transition: {
      staggerChildren: reduceMotion ? 0 : 0.035,
      staggerDirection: -1,
    },
  }),
  open: ({ reduceMotion }) => ({
    transition: {
      delayChildren: reduceMotion ? 0 : 0.03,
      staggerChildren: reduceMotion ? 0 : 0.045,
    },
  }),
};

const itemVariants = {
  closed: ({ reduceMotion }) => ({
    opacity: 0,
    y: reduceMotion ? 0 : -6,
    transition: {
      duration: reduceMotion ? 0.01 : 0.14,
      ease: MENU_EASE,
    },
  }),
  open: ({ reduceMotion }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: reduceMotion ? 0.01 : 0.22,
      ease: MENU_EASE,
    },
  }),
};

function PublicSiteMobileMenu({
  activeNavigationId,
  contactDisabled,
  id,
  isOpen,
  navigationItems,
  onContact,
  onNavigate,
}) {
  const reduceMotion = useReducedMotion();
  const motionContext = { reduceMotion: Boolean(reduceMotion) };

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <Motion.div
          key="public-site-mobile-menu"
          id={id}
          className="pointer-events-auto absolute inset-x-0 top-[67px] h-[calc(100dvh-67px)] md:hidden"
          initial="closed"
          animate="open"
          exit="closed"
          custom={motionContext}
          aria-label="Secciones de inicio"
          data-node-id="5156:130079"
        >
          <Motion.div
            className="w-full overflow-hidden bg-transparent"
            variants={panelVariants}
            custom={motionContext}
          >
            <Motion.div
              className="flex flex-col items-center gap-[24px] pt-[25px]"
              variants={listVariants}
              custom={motionContext}
            >
              <Motion.div variants={itemVariants} custom={motionContext}>
                <PublicSiteNavigationMenu
                  navigationItems={navigationItems}
                  activeNavigationId={activeNavigationId}
                  orientation="vertical"
                  onNavigate={onNavigate}
                />
              </Motion.div>

              <Motion.div variants={itemVariants} custom={motionContext}>
                <Button
                  theme="Primary"
                  type="Solid"
                  size="S"
                  fitContent
                  showLeftIcon={false}
                  showRightIcon={false}
                  className="public-site-mobile-contact"
                  onClick={onContact}
                  aria-disabled={contactDisabled || undefined}
                >
                  Contáctanos
                </Button>
              </Motion.div>
            </Motion.div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default PublicSiteMobileMenu;
