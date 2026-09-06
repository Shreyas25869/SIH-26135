import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader, Button, Table, Badge, statusTone, Modal, Field, inputClass, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

const emptyForm = { name: "", batchId: "", phone: "", district: "" };

export default function Trainees({ params }) {
  const { trainees, batches, courses, addTrainee } = useProviderData();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [batchFilter, setBatchFilter] = useState(params?.batchId || "all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = trainees.filter(
    (t) => (batchFilter === "all" || t.batchId === batchFilter) && (statusFilter === "all" || t.status === statusFilter)
  );

  const openNew = () => { setForm({ ...emptyForm, batchId: batches[0]?.id || "" }); setModal(true); };
  const submit = () => { addTrainee(form); setModal(false); };

  return (
    <div>
      <PageHeader
        title="Trainees"
        subtitle="Everyone enrolled across your batches — attendance, progress and status at a glance."
        action={<Button onClick={openNew}><Plus size={16} /> Enroll trainee</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select className={inputClass + " w-auto"} value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="all">All batches</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className={inputClass + " w-auto"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option>Ongoing</option>
          <option>Completed</option>
          <option>Dropped Out</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No trainees match" body="Adjust the filters, or enroll a trainee into a batch." />
      ) : (
        <Table columns={["Trainee", "Batch", "District", "Attendance", "Progress", "Status", ""]}>
          {filtered.map((t) => {
            const batch = batches.find((b) => b.id === t.batchId);
            return (
              <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
                <td className="px-4 py-3 text-ink/70 text-[13px]">{batch?.name || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{t.district}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-ink/80">{t.attendancePct}%</td>
                <td className="px-4 py-3">
                  <div className="w-24 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pine" style={{ width: `${t.progressPct}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(t)} className="text-[13px] text-pine hover:underline">View</button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {selected && <TraineeDrawer trainee={trainees.find((t) => t.id === selected.id) || selected} onClose={() => setSelected(null)} />}

      {modal && (
        <Modal title="Enroll trainee" onClose={() => setModal(false)}>
          <Field label="Full name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Batch">
            <select className={inputClass} value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="District">
            <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name}>Enroll</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TraineeDrawer({ trainee: t, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/30">
      <div className="w-full max-w-md bg-surface h-full overflow-y-auto border-l border-ink/10 rise-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <div>
            <h2 className="font-display text-[18px] font-semibold text-ink">{t.name}</h2>
            <p className="text-sage text-[13px]">{t.id} · {t.district}</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div>
            <Badge tone={statusTone(t.status)}>{t.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] uppercase text-sage tracking-wide mb-1">Attendance</div>
              <div className="font-display text-[22px] font-semibold text-ink">{t.attendancePct}%</div>
            </div>
            <div>
              <div className="text-[12px] uppercase text-sage tracking-wide mb-1">Progress</div>
              <div className="font-display text-[22px] font-semibold text-ink">{t.progressPct}%</div>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink/60 mb-2">Assessment history</h3>
            {t.assessments.length === 0 ? (
              <p className="text-sage text-[14px]">No assessments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {t.assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <div>
                      <div className="text-[14px] text-ink">{a.skill}</div>
                      <div className="text-[12px] text-sage font-mono">{a.date}</div>
                    </div>
                    <div className="font-mono text-[14px] text-ink/80">{a.score}/{a.maxScore}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {t.certification && (
            <div>
              <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink/60 mb-2">Certification</h3>
              <div className="counterfoil bg-white px-4 py-3">
                <div className="text-[14px] text-ink font-medium">{t.certification.name}</div>
                <div className="text-[12px] text-sage">{t.certification.level} · Issued {t.certification.issueDate}</div>
                <div className="text-[12px] font-mono text-ink/60 mt-1">{t.certification.referenceId}</div>
              </div>
            </div>
          )}

          {t.outcome && (
            <div>
              <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink/60 mb-2">Outcome</h3>
              <p className="text-[14px] text-ink">
                {t.outcome.placed ? `Placed as ${t.outcome.role} at ${t.outcome.employer}` : "Not yet placed"}
              </p>
              {t.outcome.salary && <p className="text-[13px] text-sage font-mono">₹{t.outcome.salary.toLocaleString("en-IN")}/month</p>}
            </div>
          )}

          {t.status === "Dropped Out" && (
            <div>
              <h3 className="text-[13px] font-medium uppercase tracking-wide text-brick mb-2">Dropout reason</h3>
              <p className="text-[14px] text-ink">{t.dropoutReason}</p>
              {t.dropoutNotes && <p className="text-[13px] text-sage mt-1">{t.dropoutNotes}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
