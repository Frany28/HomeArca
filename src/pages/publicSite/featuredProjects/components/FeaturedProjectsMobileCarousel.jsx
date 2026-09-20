import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  return (
    <div
      aria-label={galleryLabel}
      className="flex h-full snap-x snap-mandatory items-start gap-[16px] overflow-x-auto overscroll-x-contain px-[16px] py-[48px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      role="region"
    >
      {columns.map((cards, columnIndex) => (
        <div
          className="flex shrink-0 gap-[24px] min-[768px]:gap-[16px]"
          data-featured-gallery-carousel-group
          key={columnIndex}
        >
          {cards.map((image, imageIndex) => (
            <div
              className="relative h-[500px] w-[300px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-2)] min-[768px]:h-[416px] min-[768px]:w-[42vw]"
              data-featured-gallery-carousel-card
              key={`${image.src}-${imageIndex}`}
            >
              <ProjectImage
                {...image}
                revealOnLoad={false}
                showLoader={false}
                className="flex h-full w-full items-center justify-center"
              />
              <MainLogo
                size="20px"
                appearance="dark"
                alt=""
                className="pointer-events-none absolute left-[16px] top-[16px]"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default FeaturedProjectsMobileCarousel;
