const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const responseJson = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recipient = "cobarcoma@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return responseJson(405, {
      success: false,
      error: "Method not allowed.",
    });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return responseJson(400, {
      success: false,
      error: "Request body must be valid JSON.",
    });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return responseJson(400, {
      success: false,
      error: "Invalid form information.",
    });
  }

  const body = payload as Record<string, unknown>;
  const { name, email, subject, message, website } = body;

  if (typeof website === "string" && website.trim()) {
    return responseJson(200, { success: false, ignored: true });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string"
  ) {
    return responseJson(400, {
      success: false,
      error: "Please provide your name, email, subject, and message.",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject = subject.replace(/[\r\n]+/g, " ").trim();
  const cleanMessage = message.trim();

  if (
    !cleanName ||
    cleanName.length > 100 ||
    !emailPattern.test(cleanEmail) ||
    cleanEmail.length > 254 ||
    !cleanSubject ||
    cleanSubject.length > 200 ||
    !cleanMessage ||
    cleanMessage.length < 10 ||
    cleanMessage.length > 1000
  ) {
    return responseJson(400, {
      success: false,
      error: "Please check your contact details and message, then try again.",
    });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");

  if (!apiKey || !from) {
    console.error(
      "Contact email configuration missing RESEND_API_KEY or RESEND_FROM_EMAIL."
    );
    return responseJson(503, {
      success: false,
      error: "Email delivery is not configured on the server.",
    });
  }

  let resendResponse: Response;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: cleanEmail,
        subject: `Portfolio Contact: ${cleanSubject}`,
        text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
      }),
    });
  } catch {
    console.error("Unable to reach the Resend email API.");
    return responseJson(502, {
      success: false,
      error: "Email delivery is temporarily unavailable. Please try again.",
    });
  }

  let resendResult: { id?: unknown } | null = null;
  try {
    resendResult = await resendResponse.json();
  } catch {
    // A non-JSON response is treated as an upstream failure below.
  }

  if (!resendResponse.ok || typeof resendResult?.id !== "string") {
    console.error(
      `Resend rejected the contact email with HTTP ${resendResponse.status}.`
    );
    return responseJson(502, {
      success: false,
      error:
        "The email service did not accept the message. Check the Resend sender configuration and try again.",
    });
  }

  return responseJson(200, { success: true });
});
