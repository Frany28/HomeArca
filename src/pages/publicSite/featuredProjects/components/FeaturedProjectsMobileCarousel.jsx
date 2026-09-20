import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const images = columns.flat();

  return (
    <div
      aria-label={galleryLabel}
      className="flex h-full snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain px-[16px] py-[24px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      role="region"
    >
      {images.map((image, index) => (
        <div
          className="relative h-full w-[82vw] shrink-0 snap-start overflow-hidden rounded-[var(--radius-2)] min-[768px]:w-[42vw]"
          data-featured-gallery-carousel-card
          key={`${image.src}-${index}`}
        >
          <ProjectImage
            {...image}
            revealOnLoad={false}
            showLoader={false}
            className="flex h-full w-full items-center justify-center"
          />
        </div>
      ))}
    </div>
  );
}

export default FeaturedProjectsMobileCarousel;