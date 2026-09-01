export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const suppliedPassword = req.headers["x-admin-password"];
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: "Admin password is not configured" });
  }
  if (!suppliedPassword || suppliedPassword !== adminPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: "Server is not configured" });
  }

  try {
    const r = await fetch(
      `${supabaseUrl}/rest/v1/birthday_wishes?select=id,created_at,destination,place,food,wish&order=created_at.desc`,
      {
        headers: {
          "apikey": secretKey,
          "Authorization": `Bearer ${secretKey}`
        }
      }
    );

    if (!r.ok) {
      const text = await r.text();
      console.error("Supabase read error:", r.status, text);
      return res.status(500).json({ error: "Database read failed" });
    }

    return res.status(200).json({ rows: await r.json() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
