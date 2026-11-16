/**
 * Proxy Brevo pour le portfolio (Cloudflare Worker).
 * Secrets requis : BREVO_API_KEY, TO_EMAIL
 * Vars optionnelles : FROM_EMAIL, FROM_NAME, ALLOWED_ORIGINS (CSV)
 */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;
const hits = new Map();

function corsHeaders(origin, allowed) {
  const ok =
    !allowed.length ||
    allowed.includes("*") ||
    (origin && allowed.includes(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

function rateLimited(ip) {
  const now = Date.now();
  const row = hits.get(ip) || { count: 0, start: now };
  if (now - row.start > RATE_WINDOW_MS) {
    row.count = 0;
    row.start = now;
  }
  row.count += 1;
  hits.set(ip, row);
  return row.count > RATE_MAX;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || "*")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ status: "error", message: "Method not allowed" }, 405, cors);
    }

    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "unknown";
    if (rateLimited(ip)) {
      return json({ status: "error", message: "Trop de requêtes" }, 429, cors);
    }

    if (!env.BREVO_API_KEY || !env.TO_EMAIL) {
      return json(
        { status: "error", message: "Worker non configuré" },
        500,
        cors
      );
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ status: "error", message: "JSON invalide" }, 400, cors);
    }

    // Honeypot
    if (data.website) {
      return json({ status: "success", message: "OK" }, 200, cors);
    }

    const name = String(data.name || "").trim().slice(0, 120);
    const email = String(data.email || "").trim().slice(0, 180);
    const message = String(data.message || "").trim().slice(0, 4000);
    const type = String(data.type || "contact");

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return json({ status: "error", message: "Champs invalides" }, 400, cors);
    }

    const subject =
      String(data.subject || `Portfolio — ${type} de ${name}`).slice(0, 200);

    const extraLines = [
      data.project_type ? `Type: ${data.project_type}` : "",
      data.project_budget ? `Budget: ${data.project_budget}` : "",
      data.project_duration ? `Durée: ${data.project_duration}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const textContent = [
      `Type: ${type}`,
      `Nom: ${name}`,
      `Email: ${email}`,
      extraLines,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const htmlContent = `<h2>${escapeHtml(subject)}</h2>
<p><strong>Nom:</strong> ${escapeHtml(name)}<br/>
<strong>Email:</strong> ${escapeHtml(email)}<br/>
<strong>Type:</strong> ${escapeHtml(type)}</p>
${extraLines ? `<pre>${escapeHtml(extraLines)}</pre>` : ""}
<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`;

    const fromEmail = env.FROM_EMAIL || env.TO_EMAIL;
    const fromName = env.FROM_NAME || "Portfolio Orphée";

    const payload = {
      sender: { name: fromName, email: fromEmail },
      to: [{ email: env.TO_EMAIL }],
      replyTo: { email, name },
      subject,
      htmlContent,
      textContent,
    };

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Brevo error", brevoRes.status, errText);
      return json(
        { status: "error", message: "Échec d'envoi Brevo" },
        502,
        cors
      );
    }

    return json({ status: "success", message: "Message envoyé" }, 200, cors);
  },
};
