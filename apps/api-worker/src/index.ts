export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Extract Bearer token
function parseApiKey(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;

  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;

  return token.trim();
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/v1/health") {
      return json({ status: "ok", service: "swarmshield-core-api" });
    }

    // Log event endpoint
    if (url.pathname === "/v1/log" && req.method === "POST") {
      return handleLogEvent(req, env);
    }

    return json({ error: "Not found" }, 404);
  },
};


// ==============================
// HANDLE EVENTS
// ==============================
async function handleLogEvent(req: Request, env: Env) {
  const apiKey = parseApiKey(req);
  if (!apiKey) return json({ error: "Missing API key" }, 401);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { project_id, source, event_type, severity, payload } = body;

  if (!project_id || !source || !event_type) {
    return json({ error: "Missing required fields" }, 400);
  }

  // Validate API key through Supabase RPC
  const validateRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/validate_api_key`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw_key: apiKey, project_id }),
  });

  const validation = await validateRes.json();
  if (!validation.valid) return json({ error: "Invalid API key" }, 401);

  const user_id = validation.user_id;

  // Insert event
  const insertRes = await fetch(`${env.SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      project_id,
      user_id,
      source,
      event_type,
      severity: severity || "info",
      payload: payload || {},
    }),
  });

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return json({ error: "Failed to insert event", detail: err }, 500);
  }

  const [event] = await insertRes.json();
  return json({ success: true, event_id: event.id });
}
