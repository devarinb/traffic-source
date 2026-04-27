import { parse as parseCookie } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export type CompatQueryValue = string | string[] | undefined;
export type CompatQuery = Record<string, CompatQueryValue>;

export type LegacyRequest = {
  method: string;
  query: CompatQuery;
  body: unknown;
  headers: Record<string, string>;
  cookies: Record<string, string | undefined>;
  url: string;
};

export type LegacyHandler = (
  req: LegacyRequest,
  res: LegacyResponse,
) => unknown | Promise<unknown>;

export class LegacyResponse {
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

async function handle(handler: LegacyHandler, request: NextRequest, params: Record<string, string>) {
  const query: CompatQuery = {};
  request.nextUrl.searchParams.forEach((value, key) => addQueryValue(query, key, value));
  for (const [key, value] of Object.entries(params)) {
    query[key] = value;
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const compatRequest: LegacyRequest = {
    method: request.method,
    query,
    body: await parseBody(request),
    headers,
    cookies: parseCookie(request.headers.get("cookie") || ""),
    url: request.url,
  };

  const compatResponse = new LegacyResponse();
  await handler(compatRequest, compatResponse);
  return compatResponse.toResponse();
}

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export function createRouteHandlers(handler: LegacyHandler) {
  const dispatch = async (request: NextRequest, context: RouteContext) => {
    const rawParams = await context.params;
    const params: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawParams || {})) {
      if (typeof value === "string") {
        params[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        params[key] = value[0];
      }
    }

    return handle(handler, request, params);
  };

  return {
    GET: dispatch,
    POST: dispatch,
    PUT: dispatch,
    DELETE: dispatch,
    OPTIONS: dispatch,
    PATCH: dispatch,
    HEAD: dispatch,
  };
}
