import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRate
}: RatingStarsProps) {
  if (interactive) {
    return (
      <div role="radiogroup" aria-label="Calificacion" className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${value} de ${maxRating} estrellas`}
              onClick={() => onRate?.(value)}
              className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Star
                size={size}
                aria-hidden="true"
                className={value <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)} de ${maxRating} estrellas`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = i < rating && i >= Math.floor(rating);

        return (
          <Star
            key={i}
            size={size}
            aria-hidden="true"
            className={`${
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : partial
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
}
