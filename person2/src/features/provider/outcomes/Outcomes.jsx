import { useState } from "react";
import { PageHeader, Table, Badge, Modal, Field, inputClass, Button, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

export default function Outcomes() {
  const { trainees, setOutcome } = useProviderData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const completed = trainees.filter((t) => t.status === "Completed");

  const openEdit = (t) => {
    setForm(t.outcome || { placed: false, employer: "", role: "", salary: "", followUpDays: 90, followUpStatus: "Pending", notes: "" });
    setEditing(t.id);
  };

  const submit = () => {
    setOutcome(editing, { ...form, salary: form.salary ? Number(form.salary) : null });
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Employment outcomes"
        subtitle="What happened after training — placement, employer, salary, and the follow-up check-in."
      />

      {completed.length === 0 ? (
        <EmptyState title="No completions yet" body="Outcomes appear here once trainees complete their course." />
      ) : (
        <Table columns={["Trainee", "Outcome", "Employer / role", "Salary", "Follow-up", ""]}>
          {completed.map((t) => (
            <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
              <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
              <td className="px-4 py-3">
                {t.outcome ? (
                  <Badge tone={t.outcome.placed ? "active" : "neutral"}>{t.outcome.placed ? "Placed" : "Not placed"}</Badge>
                ) : (
                  <Badge tone="neutral">Not recorded</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-ink/70 text-[13px]">
                {t.outcome?.placed ? `${t.outcome.role} · ${t.outcome.employer}` : "—"}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-ink/70">
                {t.outcome?.salary ? `₹${t.outcome.salary.toLocaleString("en-IN")}` : "—"}
              </td>
              <td className="px-4 py-3 text-ink/70 text-[13px]">{t.outcome?.followUpStatus || "—"}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => openEdit(t)} className="text-[13px] text-pine hover:underline">
                  {t.outcome ? "Update" : "Record outcome"}
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {editing && form && (
        <Modal title="Record outcome" onClose={() => setEditing(null)}>
          <Field label="Placement status">
            <select className={inputClass} value={form.placed ? "yes" : "no"} onChange={(e) => setForm({ ...form, placed: e.target.value === "yes" })}>
              <option value="no">Not placed</option>
              <option value="yes">Placed</option>
            </select>
          </Field>
          {form.placed && (
            <>
              <Field label="Employer">
                <input className={inputClass} value={form.employer || ""} onChange={(e) => setForm({ ...form, employer: e.target.value })} />
              </Field>
              <Field label="Role">
                <input className={inputClass} value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
              <Field label="Monthly salary (₹)">
                <input type="number" className={inputClass} value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </Field>
            </>
          )}
          <Field label="Follow-up status">
            <select className={inputClass} value={form.followUpStatus} onChange={(e) => setForm({ ...form, followUpStatus: e.target.value })}>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea className={inputClass} rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submit}>Save outcome</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
