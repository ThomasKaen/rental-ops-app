// src/pages/Sites.tsx
import { useEffect, useState } from "react";
import { listSites, createSite, type Site } from "../services/sites";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    listSites().then(setSites).catch(console.error);
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createSite({ name, address });
    setName("");
    setAddress("");
    setSites(await listSites());
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Sites</h1>

      <form onSubmit={onCreate} className="space-x-2">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button className="px-3 py-1 rounded bg-black text-white">
          Create
        </button>
      </form>

      <pre className="bg-neutral-900/60 text-neutral-100 p-3 rounded">
        {JSON.stringify(sites, null, 2)}
      </pre>
    </div>
  );
}
