import { useState } from "react";
import { Plus, Archive, Pencil, ArchiveRestore } from "lucide-react";
import { PageHeader, Button, Table, Badge, statusTone, Modal, Field, inputClass, EmptyState } from "../../../shared/ui";
import { useProviderData } from "../../../shared/ProviderContext";
import { SECTORS, TRAINING_MODES, LEVELS } from "../../../data/mockData";

const emptyForm = {
  name: "",
  sector: SECTORS[0],
  duration: "",
  level: LEVELS[0],
  eligibility: "",
  skillsTaught: "",
  certification: "",
  trainingMode: TRAINING_MODES[0],
};

export default function Courses() {
  const { courses, addCourse, updateCourse, archiveCourse } = useProviderData();
  const [modal, setModal] = useState(null); // 'new' | courseId
  const [form, setForm] = useState(emptyForm);
  const [showArchived, setShowArchived] = useState(false);

  const openNew = () => { setForm(emptyForm); setModal("new"); };
  const openEdit = (course) => {
    setForm({ ...course, skillsTaught: course.skillsTaught.join(", ") });
    setModal(course.id);
  };

  const submit = () => {
    const payload = { ...form, skillsTaught: form.skillsTaught.split(",").map((s) => s.trim()).filter(Boolean) };
    if (modal === "new") addCourse(payload);
    else updateCourse(modal, payload);
    setModal(null);
  };

  const visible = courses.filter((c) => (showArchived ? c.status === "Archived" : c.status !== "Archived"));

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Define what you train people to do — sector, duration, eligibility and the certification it leads to."
        action={<Button onClick={openNew}><Plus size={16} /> New course</Button>}
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowArchived(false)} className={`text-[13px] px-3 py-1.5 rounded-sm ${!showArchived ? "bg-pine text-white" : "text-ink/60 hover:bg-ink/5"}`}>Active</button>
        <button onClick={() => setShowArchived(true)} className={`text-[13px] px-3 py-1.5 rounded-sm ${showArchived ? "bg-pine text-white" : "text-ink/60 hover:bg-ink/5"}`}>Archived</button>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No courses here yet" body="Create a course to start building batches and enrolling trainees." />
      ) : (
        <Table columns={["Course", "Sector", "Duration", "Level", "Mode", "Status", ""]}>
          {visible.map((c) => (
            <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{c.name}</div>
                <div className="text-[12px] text-sage">Certifies as {c.certification}</div>
              </td>
              <td className="px-4 py-3 text-ink/80">{c.sector}</td>
              <td className="px-4 py-3 text-ink/80 font-mono text-[13px]">{c.duration}</td>
              <td className="px-4 py-3 text-ink/80">{c.level}</td>
              <td className="px-4 py-3 text-ink/80">{c.trainingMode}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(c.status)}>{c.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex gap-1 justify-end">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-ink/40 hover:text-pine" aria-label="Edit"><Pencil size={15} /></button>
                  <button onClick={() => archiveCourse(c.id)} className="p-1.5 text-ink/40 hover:text-brick" aria-label="Archive">
                    {c.status === "Archived" ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {modal && (
        <Modal title={modal === "new" ? "New course" : "Edit course"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Field label="Course name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Sector">
              <select className={inputClass} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Duration">
              <input className={inputClass} placeholder="e.g. 3 months" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </Field>
            <Field label="NSQF level">
              <select className={inputClass} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Training mode">
              <select className={inputClass} value={form.trainingMode} onChange={(e) => setForm({ ...form, trainingMode: e.target.value })}>
                {TRAINING_MODES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Certification awarded">
              <input className={inputClass} value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} />
            </Field>
            <Field label="Eligibility">
              <input className={inputClass} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
            </Field>
            <Field label="Skills taught (comma-separated)">
              <input className={inputClass} value={form.skillsTaught} onChange={(e) => setForm({ ...form, skillsTaught: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name}>Save course</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
