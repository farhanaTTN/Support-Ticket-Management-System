import type { Comment } from "../types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="muted" style={{ fontStyle: "italic" }}>
        No comments yet. Be the first to add one.
      </p>
    );
  }
  return (
    <div>
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <div className="comment-author">
            {c.createdBy.name} ·{" "}
            {new Date(c.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="comment-message">{c.message}</div>
        </div>
      ))}
    </div>
  );
}
