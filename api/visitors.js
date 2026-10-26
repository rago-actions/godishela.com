// Returns lifetime visitor totals from Vercel Web Analytics.
// VERCEL_TOKEN and VERCEL_PROJECT_ID are server-side env vars; VERCEL_TEAM_ID is optional.
module.exports = async (req, res) => {
  const { VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID } = process.env;
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return res.status(503).json({ error: "not configured" });
  const q = new URLSearchParams({ projectId: VERCEL_PROJECT_ID });
  if (VERCEL_TEAM_ID) q.set("teamId", VERCEL_TEAM_ID);
  try {
    const r = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/count?${q}`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    if (!r.ok) return res.status(502).json({ error: "upstream" });
    const { data } = await r.json();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json({ visitors: data.visitors, pageviews: data.pageviews });
  } catch {
    res.status(502).json({ error: "upstream" });
  }
};
