// src/pages/SiteDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSite, type Site } from "../services/sites";
import { listUnitsForSite, type Unit } from "../services/units";

export default function SiteDetailPage() {
  const { id } = useParams();
  const siteId = Number(id);

  const [site, setSite] = useState<Site | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [s, u] = await Promise.all([
          getSite(siteId),
          listUnitsForSite(siteId),
        ]);
        setSite(s);
        setUnits(u);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load site");
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  if (!siteId) {
    return <div>Missing site id.</div>;
  }

  if (loading) return <div>Loading…</div>;
  if (err) return <div style={{ color: "#b91c1c" }}>{err}</div>;
  if (!site) return <div>Site not found.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <Link to="/sites" style={{ fontSize: 14 }}>
        ← Back to sites
      </Link>

      <h1 style={{ fontSize: 28, margin: "12px 0" }}>{site.name}</h1>
      <p style={{ margin: "4px 0" }}>
        <strong>Address:</strong> {site.address || "—"}
      </p>
      {site.notes && <p style={{ margin: "4px 0" }}>{site.notes}</p>}

      <h2 style={{ marginTop: 24, fontSize: 20 }}>Units</h2>
      {units.length === 0 && <div>No units yet.</div>}
      <ul>
        {units.map((u) => (
          <li key={u.id}>
            {u.name} (id {u.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
