import handler from "@/server/api/shared/affiliate/[token]";
import { createRouteHandlers } from "@/server/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD } =
  createRouteHandlers(handler);
