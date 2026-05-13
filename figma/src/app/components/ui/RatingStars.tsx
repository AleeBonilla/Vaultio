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
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = i < rating && i >= Math.floor(rating);

        return (
          <Star
            key={i}
            size={size}
            className={`${
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : partial
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-none text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(i + 1)}
          />
        );
      })}
    </div>
  );
}
