import { NextRequest, NextResponse } from "next/server";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  store: Map<string, RateLimitEntry>;
  windowMs: number;
  maxRequests: number;
  maxEntries?: number;
  error: string;
};

type FirestoreRateLimitOptions = {
  namespace: string;
  windowMs: number;
  maxRequests: number;
  error: string;
};

export function clientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function assertRateLimit(
  request: NextRequest,
  options: RateLimitOptions
) {
  const key = clientIp(request);
  const now = Date.now();
  const current = options.store.get(key);
  const maxEntries = options.maxEntries ?? 2_000;

  if (options.store.size > maxEntries) {
    for (const [entryKey, entry] of options.store.entries()) {
      if (entry.resetAt <= now) options.store.delete(entryKey);
    }
  }

  if (!current || current.resetAt <= now) {
    options.store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (current.count >= options.maxRequests) {
    return NextResponse.json(
      { success: false, error: options.error },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(options.maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  current.count += 1;
  options.store.set(key, current);
  return null;
}

function rateLimitDocumentId(namespace: string, request: NextRequest) {
  const ip = clientIp(request);
  const encodedIp = Buffer.from(ip).toString("base64url").slice(0, 120);
  return `${namespace}_${encodedIp}`;
}

export async function assertFirestoreRateLimit(
  request: NextRequest,
  options: FirestoreRateLimitOptions
) {
  const now = Date.now();
  const ref = doc(
    db,
    "server_rate_limits",
    rateLimitDocumentId(options.namespace, request)
  );

  const result = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists() ? snapshot.data() : null;
    const count = Number(data?.count ?? 0);
    const resetAt = Number(data?.resetAt ?? 0);

    if (!snapshot.exists() || resetAt <= now) {
      transaction.set(ref, {
        namespace: options.namespace,
        count: 1,
        resetAt: now + options.windowMs,
        updatedAt: new Date().toISOString(),
      });
      return { blocked: false, resetAt: now + options.windowMs };
    }

    if (count >= options.maxRequests) {
      return { blocked: true, resetAt };
    }

    transaction.set(
      ref,
      {
        count: count + 1,
        resetAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { blocked: false, resetAt };
  });

  if (!result.blocked) return null;

  return NextResponse.json(
    { success: false, error: options.error },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((result.resetAt - now) / 1000)),
        "X-RateLimit-Limit": String(options.maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
