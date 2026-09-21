const CONTACT_NAVIGATION_ITEMS = [
  { id: "services", label: "Servicios" },
  { id: "featured-projects", label: "Proyectos destacados" },
  { id: "process", label: "Nuestros Procesos" },
  { id: "about", label: "Sobre nosotros" },
];

const CONTACT_EXTERNAL_LINKS = Object.freeze({
  whatsapp: "https://wa.me/584246674832",
  instagram: "https://www.instagram.com/arcastudioarq/",
  facebook: "https://www.facebook.com/p/Arca-Studio-61583132387694/",
  tiktok: "https://www.tiktok.com/@arcastudioarq",
});

const CONTACT_SOCIAL_ITEMS = Object.freeze([
  {
    id: "instagram",
    label: "Instagram",
    icon: "instagram",
    href: CONTACT_EXTERNAL_LINKS.instagram,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "facebook",
    href: CONTACT_EXTERNAL_LINKS.facebook,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "tiktok",
    href: CONTACT_EXTERNAL_LINKS.tiktok,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "whatsapp",
    href: CONTACT_EXTERNAL_LINKS.whatsapp,
  },
]);

const CONTACT_CONTENT = {
  title: "Hagamos realidad tu próximo proyecto.",
  description:
    "Comparte con nosotros tu idea y nuestro equipo evaluará la información para acompañarte en los siguientes pasos del proceso.",
  buttonLabel: "Contáctanos",
  footerTitle: "Piénsalo y lo hacemos realidad.",
  copyright: "©2026 Arcastudio. Todos los derechos reservados.",
};

export {
  CONTACT_CONTENT,
  CONTACT_EXTERNAL_LINKS,
  CONTACT_NAVIGATION_ITEMS,
  CONTACT_SOCIAL_ITEMS,
};
