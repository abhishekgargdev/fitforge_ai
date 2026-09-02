import type { NotificationItem } from "@/types";

export interface NotificationDocLike {
  _id: { toString(): string } | string;
  title: string;
  message: string;
  type: "workout" | "progress" | "ai" | "nutrition";
  read: boolean;
  createdAt?: Date | string;
}

function formatRelativeTime(date?: Date | string): string {
  if (!date) return "Just now";
  const now = new Date().getTime();
  const d = new Date(date).getTime();
  const diffMinutes = Math.floor((now - d) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function toNotificationDto(doc: NotificationDocLike): NotificationItem {
  return {
    id: String(doc._id),
    title: doc.title,
    message: doc.message,
    type: doc.type,
    read: doc.read,
    timestamp: formatRelativeTime(doc.createdAt),
  };
}
