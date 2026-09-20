import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";
import aboutHero from "../../../../assets/about/about-hero.webp";

import { ABOUT_CONTENT } from "../aboutContent.js";
import AboutStory from "./AboutStory.jsx";

function AboutSection({
  titleVisible = false,
  progress,
}) {
  return (
    <section
      id="about"
      aria-label="Sobre nosotros"
      data-content-title-scope="about"
      data-node-id="5133:813605"
      className="
        dark
        flex
        w-full
        flex-col
        items-center
        gap-[48px]
        bg-[var(--color-neutral-950-uniform)]
        pt-[56px]
      "
    >
      <SectionTitleReveal
        visible={titleVisible}
        className="
          mx-auto
          flex
          w-full
          max-w-[1202px]
          flex-col
          items-center
          gap-[48px]
          p-[48px]
          text-center
          text-[var(--color-neutral-100-uniform)]
          max-[767px]:px-[16px]
        "
        data-node-id="5133:812440"
      >
        <p
          className="text-heading-4 m-0 whitespace-nowrap"
          data-node-id="5133:812441"
        >
          {ABOUT_CONTENT.eyebrow}
        </p>

        <h2
          className="
            text-heading-1
            m-0
            w-full
            max-w-[850px]
            text-center
            max-[767px]:text-[38px]
            max-[767px]:leading-[46px]
            max-[767px]:tracking-[-1px]
          "
          data-node-id="5133:812442"
        >
          {ABOUT_CONTENT.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
      </SectionTitleReveal>

      <AboutStory
        image={aboutHero}
        progress={progress}
      />
    </section>
  );
}

export default AboutSection;