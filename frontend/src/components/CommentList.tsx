import type { Comment } from "../types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="muted">No comments yet.</p>;
  }
  return (
    <div>
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <div className="muted">
            {c.createdBy.name} - {new Date(c.createdAt).toLocaleString()}
          </div>
          <div>{c.message}</div>
        </div>
      ))}
    </div>
  );
}
