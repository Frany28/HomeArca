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
        max-[1024px]:pb-[56px]
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
          max-[767px]:py-[48px]
        "
        data-node-id="5133:812440"
      >
        <p
          className="text-heading-4 m-0 whitespace-nowrap max-[767px]:text-[20px] max-[767px]:leading-[24px] max-[767px]:tracking-[-0.5px]"
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
            max-[767px]:text-[24px]
            max-[767px]:leading-[30px]
            max-[767px]:tracking-[-0.5px]
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

      <div className="hidden w-full min-[1025px]:block">
        <AboutStory
          image={aboutHero}
          progress={progress}
        />
      </div>

      <div
        className="flex w-full flex-col items-center gap-[48px] min-[1025px]:hidden"
        data-node-id="5136:15322"
      >
        <div
          className="relative aspect-[4096/2731] w-full shrink-0"
          data-node-id="5136:15077"
        >
          <img
            src={aboutHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-bottom"
          />
        </div>

        <div className="flex w-full max-w-[640px] items-center justify-center px-[16px] py-[48px]">
          <p className="m-0 w-full text-center text-[20px] font-bold leading-[24px] tracking-[-0.5px] text-[var(--color-neutral-100-uniform)] opacity-60">
            {ABOUT_CONTENT.description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
