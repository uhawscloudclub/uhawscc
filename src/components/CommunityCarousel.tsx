import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  getCommunityPhotos,
  type CommunityPhoto,
} from "@/data/communityPhotos";

const REGION_LABEL = "Photos from CloudHub UH events";

/**
 * Matches ScrollReveal's synchronous check rather than a useEffect: reading it
 * during render avoids a frame of animation before the preference is applied.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Shared frame so every slide reserves identical space before images load. */
function PhotoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-border bg-muted">
      {children}
    </div>
  );
}

function PhotoSlide({ photo }: { photo: CommunityPhoto }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="m-0">
      <PhotoFrame>
        {failed ? (
          // The slide keeps its dimensions rather than being removed. Removing
          // it post-init would desync embla's slide count, canScrollNext, the
          // "n of total" labels and the live region.
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <span className="text-sm text-muted-foreground">
              {photo.caption}
            </span>
          </div>
        ) : (
          <img
            src={photo.src}
            srcSet={`${photo.srcSmall} 600w, ${photo.src} 1200w`}
            sizes="(min-width: 1024px) 900px, 100vw"
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </PhotoFrame>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        {photo.caption}
      </figcaption>
    </figure>
  );
}

interface CommunityCarouselProps {
  /** Defaults to the curated set; injectable so tests need no module mocking. */
  photos?: CommunityPhoto[];
}

const CommunityCarousel = ({ photos }: CommunityCarouselProps) => {
  const slides = getCommunityPhotos(photos);
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // No photos: render nothing at all rather than an empty placeholder.
  if (slides.length === 0) return null;

  // A single photo is not a carousel — carousel chrome around one slide is a
  // broken affordance (arrows that can never move, a position announcement
  // with nowhere to go).
  if (slides.length === 1) {
    return <PhotoSlide photo={slides[0]} />;
  }

  return (
    <Carousel
      aria-label={REGION_LABEL}
      tabIndex={0}
      setApi={setApi}
      opts={{ align: "start", duration: prefersReducedMotion() ? 0 : 25 }}
      className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <CarouselContent>
        {slides.map((photo, i) => (
          <CarouselItem
            key={photo.id}
            aria-label={`${i + 1} of ${slides.length}: ${photo.caption}`}
          >
            <PhotoSlide photo={photo} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Controls sit inside the frame and at a 44px target. The primitive
          defaults to h-8 w-8 at -left-12/-right-12, which is both under the
          minimum touch size and positioned outside the box (clipping on a
          full-width section). */}
      <CarouselPrevious className="left-3 top-[calc(50%-1.75rem)] h-11 w-11" />
      <CarouselNext className="right-3 top-[calc(50%-1.75rem)] h-11 w-11" />

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${selected + 1} of ${slides.length}: ${slides[selected]?.caption ?? ""}`}
      </p>
    </Carousel>
  );
};

export default CommunityCarousel;
