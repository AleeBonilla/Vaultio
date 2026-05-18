interface CommentBlockProps {
  author: string;
  date: string;
  content: string;
}

export function CommentBlock({ author, date, content }: CommentBlockProps) {
  const initial = author?.[0]?.toUpperCase() || "?";

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-semibold flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{author}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      </div>
    </div>
  );
}
