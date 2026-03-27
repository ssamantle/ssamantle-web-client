import { Children, ReactElement, ReactNode } from 'react';

interface CarouselProps {
  step: number;
  showIndicators?: boolean;
  children: ReactElement<ItemProps> | ReactElement<ItemProps>[];
}

interface ItemProps {
  eyebrow: string;
  children: ReactNode;
}

function StepCarouselItem({ eyebrow, children }: ItemProps) {
  return (
    <div className="step-carousel-item">
      <p className="step-carousel-item-eyebrow">{eyebrow}</p>
      {children}
    </div>
  );
}

function StepCarousel({ step, showIndicators = false, children }: CarouselProps) {
  const slideCount = Children.count(children);
  const slideWidthPct = 100 / slideCount;

  return (
    <div className="step-carousel">
      <div
        className="step-carousel-track"
        style={{
          width: `${slideCount * 100}%`,
          transform: `translateX(-${step * slideWidthPct}%)`,
        }}
      >
        {Children.map(children, slide => (
          <div className="step-carousel-slide" style={{ width: `${slideWidthPct}%` }}>
            {slide}
          </div>
        ))}
      </div>
      {showIndicators && (
        <div className="step-carousel-indicators">
          {Array.from({ length: slideCount }, (_, i) => (
            <span
              key={i}
              className={`step-carousel-dot${i === step ? ' step-carousel-dot-active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

StepCarousel.Item = StepCarouselItem;

export { StepCarousel };
