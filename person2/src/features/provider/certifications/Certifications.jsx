import { useState } from "react";
import { Award, Plus } from "lucide-react";
import { PageHeader, Button, Table, Modal, Field, inputClass, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

const emptyForm = { traineeId: "", name: "", level: "", issueDate: "", referenceId: "" };

export default function Certifications() {
  const { trainees, issueCertification } = useProviderData();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const certified = trainees.filter((t) => t.certification);
  const eligible = trainees.filter((t) => !t.certification && t.status !== "Dropped Out");

  const openNew = () => {
    setForm({ ...emptyForm, traineeId: eligible[0]?.id || "", referenceId: `CERT-2026-${String(10000 + trainees.length).slice(1)}` });
    setModal(true);
  };

  const submit = () => {
    issueCertification(form.traineeId, {
      name: form.name,
      level: form.level,
      issueDate: form.issueDate || new Date().toISOString().slice(0, 10),
      referenceId: form.referenceId,
    });
    setModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Certifications"
        subtitle="Issue a certification once a trainee completes their course, with a verifiable reference ID."
        action={<Button onClick={openNew} disabled={eligible.length === 0}><Plus size={16} /> Issue certificate</Button>}
      />

      {certified.length === 0 ? (
        <EmptyState title="No certificates issued yet" body="Issue a certification once a trainee finishes their course." />
      ) : (
        <Table columns={["Trainee", "Certification", "Level", "Issue date", "Reference ID"]}>
          {certified.map((t) => (
            <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
              <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
              <td className="px-4 py-3 text-ink/80 flex items-center gap-2"><Award size={14} className="text-ochre" /> {t.certification.name}</td>
              <td className="px-4 py-3 text-ink/70">{t.certification.level}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-ink/70">{t.certification.issueDate}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-ink/60">{t.certification.referenceId}</td>
            </tr>
          ))}
        </Table>
      )}

      {modal && (
        <Modal title="Issue certificate" onClose={() => setModal(false)}>
          <Field label="Trainee">
            <select className={inputClass} value={form.traineeId} onChange={(e) => setForm({ ...form, traineeId: e.target.value })}>
              {eligible.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Certification name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Level">
            <input className={inputClass} placeholder="e.g. NSQF Level 4" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          </Field>
          <Field label="Issue date">
            <input type="date" className={inputClass} value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
          </Field>
          <Field label="Reference / verification ID">
            <input className={inputClass} value={form.referenceId} onChange={(e) => setForm({ ...form, referenceId: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name || !form.traineeId}>Issue</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
