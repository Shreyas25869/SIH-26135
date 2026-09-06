import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader, Button, Table, Badge, statusTone, Modal, Field, inputClass, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";

const emptyForm = { courseId: "", name: "", startDate: "", endDate: "", trainer: "", capacity: 30, status: "Ongoing" };

export default function Batches({ navigate }) {
  const { courses, batches, trainees, addBatch, updateBatch } = useProviderData();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setForm({ ...emptyForm, courseId: courses[0]?.id || "" }); setModal("new"); };
  const openEdit = (b) => { setForm(b); setModal(b.id); };

  const submit = () => {
    if (modal === "new") addBatch(form);
    else updateBatch(modal, form);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Batches"
        subtitle="Schedule a run of a course — dates, trainer, capacity, and who's enrolled."
        action={<Button onClick={openNew}><Plus size={16} /> New batch</Button>}
      />

      {batches.length === 0 ? (
        <EmptyState title="No batches yet" body="Create a batch to start enrolling trainees into a course." />
      ) : (
        <Table columns={["Batch", "Course", "Trainer", "Dates", "Enrolled", "Status", ""]}>
          {batches.map((b) => {
            const course = courses.find((c) => c.id === b.courseId);
            const count = trainees.filter((t) => t.batchId === b.id).length;
            return (
              <tr key={b.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-medium text-ink">{b.name}</td>
                <td className="px-4 py-3 text-ink/80">{course?.name || "—"}</td>
                <td className="px-4 py-3 text-ink/80">{b.trainer}</td>
                <td className="px-4 py-3 text-ink/70 text-[13px] font-mono">{b.startDate} → {b.endDate}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate("trainees", { batchId: b.id })} className="flex items-center gap-1.5 text-ink/80 hover:text-pine">
                    <Users size={14} /> {count}/{b.capacity}
                  </button>
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone(b.status)}>{b.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(b)} className="text-[13px] text-pine hover:underline">Edit</button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {modal && (
        <Modal title={modal === "new" ? "New batch" : "Edit batch"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Field label="Course">
              <select className={inputClass} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Batch name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Start date">
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="End date">
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
            <Field label="Trainer">
              <input className={inputClass} value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} />
            </Field>
            <Field label="Capacity">
              <input type="number" className={inputClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Completed</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name}>Save batch</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
