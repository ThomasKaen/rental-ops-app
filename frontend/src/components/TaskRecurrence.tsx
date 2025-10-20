import { useState } from "react";

type Props = {
  value?: {
    is_recurring?: boolean;
    recurrence?: "daily"|"weekly"|"monthly"|"quarterly"|"yearly"|null;
    recur_interval?: number|null;
    recur_dow?: number|null;
    recur_dom?: number|null;
    due_at?: string|null;
    recur_until?: string|null;
  };
  onChange: (v: Props["value"]) => void;
};

export default function TaskRecurrence({ value, onChange }: Props) {
  const [v, setV] = useState<Props["value"]>({
    is_recurring: value?.is_recurring ?? false,
    recurrence: value?.recurrence ?? null,
    recur_interval: value?.recur_interval ?? 1,
    recur_dow: value?.recur_dow ?? null,
    recur_dom: value?.recur_dom ?? null,
    due_at: value?.due_at ?? null,
    recur_until: value?.recur_until ?? null,
  });

  const upd = (patch: Partial<NonNullable<Props["value"]>>) => {
    const nv = { ...v, ...patch };
    setV(nv);
    onChange(nv);
  };

  return (
    <fieldset style={{border:"1px solid #eee", padding:12, borderRadius:8, marginTop:12}}>
      <legend>Recurrence</legend>

      <label>
        <input
          type="checkbox"
          checked={!!v?.is_recurring}
          onChange={e => upd({ is_recurring: e.target.checked })}
        />{" "}
        Make this a recurring template
      </label>

      {v?.is_recurring && (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8}}>
          <div>
            <label>Pattern</label><br/>
            <select
              value={v?.recurrence ?? ""}
              onChange={e => upd({ recurrence: e.target.value as any })}
            >
              <option value="">— select —</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label>Every (interval)</label><br/>
            <input
              type="number"
              min={1}
              value={v?.recur_interval ?? 1}
              onChange={e => upd({ recur_interval: Math.max(1, Number(e.target.value||1)) })}
            />
          </div>

          <div>
            <label>Template Due (UTC)</label><br/>
            <input
              type="datetime-local"
              value={v?.due_at ?? ""}
              onChange={e => upd({ due_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>

          <div>
            <label>Until (optional)</label><br/>
            <input
              type="datetime-local"
              value={v?.recur_until ?? ""}
              onChange={e => upd({ recur_until: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>

          <div>
            <label>Day of Week (0–6, optional)</label><br/>
            <input
              type="number"
              min={0} max={6}
              value={v?.recur_dow ?? ""}
              onChange={e => upd({ recur_dow: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>

          <div>
            <label>Day of Month (1–31, optional)</label><br/>
            <input
              type="number"
              min={1} max={31}
              value={v?.recur_dom ?? ""}
              onChange={e => upd({ recur_dom: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
