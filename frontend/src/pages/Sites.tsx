import { useEffect, useState } from "react";
import type React from "react";
import { listSites, createSite, type Site } from "../services/sites";

// ---- design tokens (same palette as Units) ----
const C = {
  text: "#0f172a",
  textSub: "#475569",
  textMuted: "#64748b",
  border: "#e2e8f0",
  bgCard: "#ffffff",
  bgPage: "#ffffff",
  primary: "#1d4ed8",
};

const pageWrap: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "20px 16px 40px",
};

const h1Style: React.CSSProperties = {
  margin: "6px 0 4px",
  fontSize: 28,
  fontWeight: 700,
  color: C.text,
};

const pLead: React.CSSProperties = {
  margin: 0,
  color: C.textMuted,
};

const toolbar: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginTop: 16,
  flexWrap: "wrap",
};

const input: React.CSSProperties = {
  height: 36,
  padding: "0 10px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  outline: "none",
  fontSize: 14,
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: `1px solid ${C.primary}`,
  background: C.primary,
  color: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const listWrap: React.CSSProperties = {
  marginTop: 20,
  display: "grid",
  gap: 10,
};

const card: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  background: C.bgCard,
  padding: 14,
  display: "grid",
  gap: 4,
};

const rowTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
};

const nameStyle: React.CSSProperties = {
  fontWeight: 600,
  color: C.text,
};

const metaStyle: React.CSSProperties = {
  fontSize: 13,
  color: C.textMuted,
};

const badge: React.CSSProperties = {
  padding: "2px 8px",
  borderRadius: 999,
  border: `1px solid ${C.border}`,
  fontSize: 11,
  color: C.textSub,
};

// ---- page ----
export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listSites().then(setSites).catch(console.error);
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    try {
      setLoading(true);
      await createSite({ name: name.trim(), address: address.trim() });
      setName("");
      setAddress("");
      const updated = await listSites();
      setSites(updated);
    } catch (err) {
      console.error(err);
      alert("Could not create site.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: C.bgPage, minHeight: "100vh" }}>
      <div style={pageWrap}>
        <h1 style={h1Style}>Sites</h1>
        <p style={pLead}>Manage your properties / locations.</p>

        <form onSubmit={onCreate} style={toolbar}>
          <input
            style={input}
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={input}
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <button type="submit" style={btnPrimary} disabled={loading}>
            {loading ? "Saving..." : "Create site"}
          </button>
        </form>

        <div style={listWrap}>
          {sites.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 14 }}>
              No sites yet. Add your first one above.
            </div>
          )}

          {sites.map(s => (
            <div key={s.id} style={card}>
              <div style={rowTop}>
                <div>
                  <div style={nameStyle}>{s.name}</div>
                  <div style={metaStyle}>{s.address}</div>
                </div>
                <div style={badge}>ID #{s.id}</div>
              </div>

              {"notes" in s && (s as any).notes && (
                <div style={{ fontSize: 13, color: C.textSub }}>
                  {(s as any).notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
