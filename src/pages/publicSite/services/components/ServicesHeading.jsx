import MovingGradientTitle from "./MovingGradientTitle.jsx";
import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";

function ServicesHeading({ eyebrow, title, titleMobile = [], description, visible = false }) {
  return (
    <section
      className="relative flex w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[24px] py-[48px] min-[768px]:px-[48px]"
      aria-label={eyebrow}
    >
      <SectionTitleReveal
        visible={visible}
        className="flex w-full max-w-[786px] flex-col items-center gap-[24px] text-center"
        data-node-id="4848:8081"
      >
        <p
          className="text-heading-4 text-[var(--color-neutral-100-uniform)] max-[767px]:text-[20px] max-[767px]:leading-[24px] max-[767px]:tracking-[-0.5px]"
          data-node-id="4848:8082"
        >
          {eyebrow}
        </p>

        <MovingGradientTitle
          className="m-0 w-full text-[24px] font-bold leading-[30px] tracking-[-0.5px] min-[768px]:text-[64px] min-[768px]:leading-[76px] min-[768px]:tracking-[-2px] min-[1024px]:pb-[0.08em]"
          data-node-id="4848:8083"
        >
          <span className="hidden min-[768px]:inline">
            {title}
          </span>

          <span className="min-[768px]:hidden">
            {titleMobile.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </span>
        </MovingGradientTitle>

        <p
          className="text-heading-6 m-0 w-full break-words text-[18px] font-bold leading-[22px] tracking-[-0.5px] text-[var(--color-neutral-100-uniform)] opacity-60 max-[767px]:w-[343px] max-[767px]:max-w-[calc(100vw-32px)]"
          data-node-id="4848:8084"
        >
          {description}
        </p>
      </SectionTitleReveal>
    </section>
  );
}

export default ServicesHeading;
