import { MessageCircle, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/Button";

interface CommentBlockProps {
  author: string;
  authorId?: string | null;
  authorPhotoUrl?: string | null;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  userVote: -1 | 0 | 1;
  isDeleted?: boolean;
  canDelete?: boolean;
  depth?: number;
  onVote: (vote: 1 | -1) => void;
  onReply: (content: string) => Promise<void> | void;
  onDelete: () => void;
  children?: ReactNode;
}

export function CommentBlock({
  author,
  authorId,
  authorPhotoUrl,
  date,
  content,
  likes,
  dislikes,
  userVote,
  isDeleted,
  canDelete,
  depth = 0,
  onVote,
  onReply,
  onDelete,
  children,
}: CommentBlockProps) {
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const initial = author?.[0]?.toUpperCase() || "?";

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = replyDraft.trim();
    if (!content) return;
    await onReply(content);
    setReplyDraft("");
    setReplying(false);
  };

  return (
    <div className={`${depth > 0 ? "border-l border-blue-100 pl-4" : "border-b border-blue-100 pb-4 last:border-0"}`}>
      <div className="flex items-start gap-3">
        {authorId && !isDeleted ? (
          <Link to={`/app/users/${authorId}`} className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {authorPhotoUrl ? (
              <img src={authorPhotoUrl} alt={`Foto de ${author}`} className="h-10 w-10 rounded-full object-cover shadow-md shadow-blue-900/10" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-md shadow-blue-600/20">
                {initial}
              </div>
            )}
          </Link>
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-400 shadow-md shadow-slate-900/5">
            ?
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {authorId && !isDeleted ? (
              <Link to={`/app/users/${authorId}`} className="font-medium text-slate-900 hover:text-blue-700">
                {author}
              </Link>
            ) : (
              <span className="font-medium text-slate-500">{author}</span>
            )}
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500">{date}</span>
          </div>
          <p className={`whitespace-pre-line text-sm ${isDeleted ? "italic text-slate-500" : "text-slate-700"}`}>{content}</p>

          {!isDeleted && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onVote(1)}
                aria-pressed={userVote === 1}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  userVote === 1 ? "bg-blue-600 text-white" : "bg-blue-50 text-slate-600 hover:bg-blue-100"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {likes}
              </button>
              <button
                type="button"
                onClick={() => onVote(-1)}
                aria-pressed={userVote === -1}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  userVote === -1 ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                {dislikes}
              </button>
              <button
                type="button"
                onClick={() => setReplying((current) => !current)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Responder
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              )}
            </div>
          )}

          {replying && (
            <form onSubmit={handleReply} className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-3">
              <textarea
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Escribí una respuesta..."
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700" disabled={!replyDraft.trim()}>
                  Responder
                </Button>
              </div>
            </form>
          )}

          {children && <div className="mt-4 space-y-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
