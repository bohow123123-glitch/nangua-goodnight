export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tonight_choice = "", destination, place = "", food = "", wish = "" } = req.body || {};
  if (!destination || typeof destination !== "string") {
    return res.status(400).json({ error: "Missing destination" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: "Server is not configured" });
  }

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/birthday_wishes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": secretKey,
        "Authorization": `Bearer ${secretKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        tonight_choice: String(tonight_choice).slice(0, 150),
        destination: destination.slice(0, 100),
        place: String(place).slice(0, 300),
        food: String(food).slice(0, 300),
        wish: String(wish).slice(0, 2000)
      })
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Supabase insert error:", r.status, text);
      return res.status(500).json({ error: "Database insert failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
