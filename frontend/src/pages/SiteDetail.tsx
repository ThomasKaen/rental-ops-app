import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getSite,
  type Site,
} from "../services/sites";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function SiteDetail() {
  const { id } = useParams();
  const [site, setSite] = useState<Site | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getSite(Number(id));
        setSite(data);
      } catch (e: any) {
        setErr(
          e?.response?.data?.detail ??
            e?.message ??
            "Failed to load site"
        );
      }
    })();
  }, [id]);

  if (!site) {
    return (
      <div className="p-4 text-sm text-slate-500">
        {err ?? "Loading…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                {site.name}
              </CardTitle>
              <p className="text-sm text-slate-600">
                Site ID: {site.id}
              </p>
            </div>
            <Link to="/sites">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {site.address && (
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Address
                </p>
                <p className="text-sm text-slate-800">{site.address}</p>
              </div>
            )}

            {site.notes && (
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Notes
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {site.notes}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 uppercase">Units</p>
              <p className="text-sm text-slate-800">
                {site.units ?? "–"}
              </p>
            </div>

            <Link to={`/units?site_id=${site.id}`}>
              <Button className="mt-2" size="sm">
                Manage Units →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
