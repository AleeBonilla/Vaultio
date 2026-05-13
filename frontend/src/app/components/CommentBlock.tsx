import { ThumbsUp } from 'lucide-react';
import { RatingStars } from './ui/RatingStars';

interface CommentBlockProps {
  author: string;
  date: string;
  rating: number;
  comment: string;
  helpful: number;
  avatar?: string;
}

export function CommentBlock({ author, date, rating, comment, helpful }: CommentBlockProps) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
          {author[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{author}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={rating} size={14} />
          </div>
          <p className="text-sm text-gray-700 mb-3">{comment}</p>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
            Helpful ({helpful})
          </button>
        </div>
      </div>
    </div>
  );
}
