import { parse as parseCookie } from "cookie";
import { NextRequest, NextResponse } from "next/server";

type LegacyHandler = (req: LegacyRequest, res: LegacyResponse) => unknown | Promise<unknown>;
type LegacyModule = { default: LegacyHandler };

type RouteDefinition = {
  pattern: string[];
  load: () => Promise<LegacyModule>;
};

type CompatQueryValue = string | string[] | undefined;
type CompatQuery = Record<string, CompatQueryValue>;

type LegacyRequest = {
  method: string;
  query: CompatQuery;
  body: unknown;
  headers: Record<string, string>;
  cookies: Record<string, string | undefined>;
  url: string;
};

const definitions: RouteDefinition[] = [
  { pattern: ["collect"], load: () => import("@/legacy-api/collect") },
  {
    pattern: ["analytics", "[siteId]", "affiliates"],
    load: () => import("@/legacy-api/analytics/[siteId]/affiliates"),
  },
  {
    pattern: ["analytics", "[siteId]", "conversions"],
    load: () => import("@/legacy-api/analytics/[siteId]/conversions"),
  },
  {
    pattern: ["analytics", "[siteId]", "flow"],
    load: () => import("@/legacy-api/analytics/[siteId]/flow"),
  },
  {
    pattern: ["analytics", "[siteId]", "overview"],
    load: () => import("@/legacy-api/analytics/[siteId]/overview"),
  },
  {
    pattern: ["analytics", "[siteId]", "realtime"],
    load: () => import("@/legacy-api/analytics/[siteId]/realtime"),
  },
  {
    pattern: ["analytics", "[siteId]", "visitor-journey"],
    load: () => import("@/legacy-api/analytics/[siteId]/visitor-journey"),
  },
  {
    pattern: ["analytics", "[siteId]", "affiliates", "[affiliateId]"],
    load: () => import("@/legacy-api/analytics/[siteId]/affiliates/[affiliateId]"),
  },
  {
    pattern: ["analytics", "[siteId]", "affiliates", "[affiliateId]", "share"],
    load: () =>
      import("@/legacy-api/analytics/[siteId]/affiliates/[affiliateId]/share"),
  },
  { pattern: ["auth", "login"], load: () => import("@/legacy-api/auth/login") },
  { pattern: ["auth", "logout"], load: () => import("@/legacy-api/auth/logout") },
  { pattern: ["auth", "me"], load: () => import("@/legacy-api/auth/me") },
  { pattern: ["auth", "register"], load: () => import("@/legacy-api/auth/register") },
  { pattern: ["auth", "status"], load: () => import("@/legacy-api/auth/status") },
  {
    pattern: ["auth", "google", "callback"],
    load: () => import("@/legacy-api/auth/google/callback"),
  },
  { pattern: ["cron", "aggregate"], load: () => import("@/legacy-api/cron/aggregate") },
  {
    pattern: ["cron", "stripe-sync"],
    load: () => import("@/legacy-api/cron/stripe-sync"),
  },
  {
    pattern: ["settings", "integrations", "gsc", "connect"],
    load: () => import("@/legacy-api/settings/integrations/gsc/connect"),
  },
  {
    pattern: ["settings", "integrations", "gsc", "credentials"],
    load: () => import("@/legacy-api/settings/integrations/gsc/credentials"),
  },
  {
    pattern: ["settings", "integrations", "gsc", "disconnect"],
    load: () => import("@/legacy-api/settings/integrations/gsc/disconnect"),
  },
  {
    pattern: ["settings", "integrations", "gsc", "status"],
    load: () => import("@/legacy-api/settings/integrations/gsc/status"),
  },
  {
    pattern: ["shared", "affiliate", "[token]"],
    load: () => import("@/legacy-api/shared/affiliate/[token]"),
  },
  { pattern: ["sites"], load: () => import("@/legacy-api/sites/index") },
  { pattern: ["sites", "[id]"], load: () => import("@/legacy-api/sites/[id]") },
  {
    pattern: ["sites", "[id]", "snippet"],
    load: () => import("@/legacy-api/sites/[id]/snippet"),
  },
  {
    pattern: ["sites", "[id]", "affiliates"],
    load: () => import("@/legacy-api/sites/[id]/affiliates/index"),
  },
  {
    pattern: ["sites", "[id]", "affiliates", "[affiliateId]"],
    load: () => import("@/legacy-api/sites/[id]/affiliates/[affiliateId]"),
  },
  {
    pattern: ["sites", "[id]", "gsc", "data"],
    load: () => import("@/legacy-api/sites/[id]/gsc/data"),
  },
  {
    pattern: ["sites", "[id]", "gsc", "disconnect"],
    load: () => import("@/legacy-api/sites/[id]/gsc/disconnect"),
  },
  {
    pattern: ["sites", "[id]", "gsc", "keyword"],
    load: () => import("@/legacy-api/sites/[id]/gsc/keyword"),
  },
  {
    pattern: ["sites", "[id]", "gsc", "link"],
    load: () => import("@/legacy-api/sites/[id]/gsc/link"),
  },
  {
    pattern: ["sites", "[id]", "gsc", "properties"],
    load: () => import("@/legacy-api/sites/[id]/gsc/properties"),
  },
  {
    pattern: ["stripe", "webhook"],
    load: () => import("@/legacy-api/stripe/webhook"),
  },
];

class LegacyResponse {
  private statusCode = 200;
  private readonly headers = new Headers();
  private body: BodyInit | null = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  setHeader(name: string, value: string | string[]) {
    this.headers.delete(name);
    if (Array.isArray(value)) {
      for (const item of value) this.headers.append(name, item);
      return this;
    }
    this.headers.set(name, value);
    return this;
  }

  json(payload: unknown) {
    if (!this.headers.has("Content-Type")) {
      this.headers.set("Content-Type", "application/json; charset=utf-8");
    }
    this.body = JSON.stringify(payload);
    return this;
  }

  send(payload: BodyInit) {
    this.body = payload;
    return this;
  }

  end(payload?: BodyInit) {
    if (payload !== undefined) this.body = payload;
    return this;
  }

  redirect(url: string, status = 307) {
    this.statusCode = status;
    this.headers.set("Location", url);
    return this;
  }

  toResponse() {
    return new NextResponse(this.body, {
      status: this.statusCode,
      headers: this.headers,
    });
  }
}

function addQueryValue(query: CompatQuery, key: string, value: string) {
  const current = query[key];
  if (current === undefined) {
    query[key] = value;
    return;
  }
  if (Array.isArray(current)) {
    current.push(value);
    return;
  }
  query[key] = [current, value];
}

function matchRoute(pathParts: string[]) {
  for (const definition of definitions) {
    if (definition.pattern.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (let index = 0; index < definition.pattern.length; index += 1) {
      const expected = definition.pattern[index];
      const actual = pathParts[index];
      if (expected.startsWith("[") && expected.endsWith("]")) {
        params[expected.slice(1, -1)] = actual;
        continue;
      }
      if (expected !== actual) {
        matches = false;
        break;
      }
    }

    if (matches) return { definition, params };
  }

  return null;
}

async function parseBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;

  const text = await request.text();
  if (!text) return undefined;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handle(request: NextRequest, rawPath: string[]) {
  const pathParts = rawPath.filter(Boolean);
  const match = matchRoute(pathParts);

  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query: CompatQuery = {};
  request.nextUrl.searchParams.forEach((value, key) => addQueryValue(query, key, value));
  for (const [key, value] of Object.entries(match.params)) {
    query[key] = value;
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const cookieHeader = request.headers.get("cookie") || "";
  const legacyRequest: LegacyRequest = {
    method: request.method,
    query,
    body: await parseBody(request),
    headers,
    cookies: parseCookie(cookieHeader),
    url: request.url,
  };

  const legacyResponse = new LegacyResponse();
  const legacyModule = await match.definition.load();
  await legacyModule.default(legacyRequest, legacyResponse);
  return legacyResponse.toResponse();
}

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

async function dispatch(request: NextRequest, context: RouteContext) {
  const resolved = await context.params;
  return handle(request, resolved.path || []);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export function OPTIONS(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}
