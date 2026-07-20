import type { Priority } from "../types";

const LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge priority-badge priority-${priority}`}>
      {LABELS[priority]}
    </span>
  );
}
