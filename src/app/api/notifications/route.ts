import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toNotificationDto } from "@/lib/notifications/map";
import { notificationListQuery } from "@/lib/validation/notifications";
import { NotificationModel } from "@/models/Notification";

const INITIAL_WELCOME_NOTIFICATIONS = [
  {
    title: "Welcome to FitForge AI!",
    message: "Your personalized AI fitness hub is configured and ready.",
    type: "ai" as const,
  },
  {
    title: "Workout Split Ready",
    message: "Check out your custom workout plan generated based on your goals.",
    type: "workout" as const,
  },
  {
    title: "Nutrition Targets Active",
    message: "Daily macro targets calculated according to your BMR/TDEE profile.",
    type: "nutrition" as const,
  },
  {
    title: "Track Your Progress",
    message: "Log your weight and body measurements to unlock AI progress analysis.",
    type: "progress" as const,
  },
];

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const url = new URL(request.url);
    const parsed = notificationListQuery.safeParse({
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "20",
      unreadOnly: url.searchParams.get("unreadOnly") ?? "false",
    });

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }

    const { page, limit, unreadOnly } = parsed.data;
    const userId = session.user._id;

    // Seed initial notifications if user has 0 notifications
    const existingCount = await NotificationModel.countDocuments({ userId });
    if (existingCount === 0) {
      await NotificationModel.insertMany(
        INITIAL_WELCOME_NOTIFICATIONS.map((item) => ({
          userId,
          ...item,
          read: false,
        }))
      );
    }

    const filter: Record<string, unknown> = { userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(filter),
    ]);

    const items = rows.map(toNotificationDto);
    return ok({
      items,
      notifications: items, // Alias for backward compatibility with UI components
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("[notifications:list]", error);
    return fail("Unable to load notifications.", 500, "NOTIFICATIONS_LOAD_FAILED");
  }
}
