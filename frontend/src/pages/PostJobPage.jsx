import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, X } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const JOB_TYPES = ["full-time", "part-time", "freelance", "internship"];
const inputClass = "w-full rounded-xl border border-slate-200 bg-white text-slate-900 font-medium px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-slate-900 mb-1.5";

export default function PostJobPage() {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    salon: "",
    description: "",
    skills: [],
    experience: 0,
    salaryMin: "",
    salaryMax: "",
    location: "",
    jobType: "full-time",
    deadline: "",
  });

  useEffect(() => {
    api.get("/salons").then((r) => setSalons(r.data.data || [])).catch(() => {});
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      set("skills", [...form.skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => set("skills", form.skills.filter((x) => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.salon) { toast.error("Please select a salon."); return; }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        salon: form.salon,
        description: form.description,
        skills: form.skills,
        experience: Number(form.experience),
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: "INR",
        },
        location: form.location,
        jobType: form.jobType,
        deadline: form.deadline || undefined,
      };
      await api.post("/jobs", payload);
      toast.success("Job posted successfully!");
      navigate("/owner-jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || err.customMessage || "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Post a Vacancy</h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details to publish a job opening for barbers.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">

          {/* Salon */}
          <div>
            <label className={labelClass}>Salon *</label>
            <select value={form.salon} onChange={(e) => set("salon", e.target.value)} className={inputClass} required>
              <option value="">Select your salon...</option>
              {salons.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.city}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className={labelClass}>Job Title *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Barber" className={inputClass} required />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="Describe the role, responsibilities, and expectations..." className={`${inputClass} resize-none`} required />
          </div>

          {/* Skills */}
          <div>
            <label className={labelClass}>Skills Required</label>
            <div className="flex gap-2">
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill(e)} placeholder="Add a skill and press Enter" className={`${inputClass} flex-1`} />
              <button type="button" onClick={addSkill} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row: Experience + Job Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min. Experience (years)</label>
              <input type="number" min="0" value={form.experience} onChange={(e) => set("experience", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Employment Type *</label>
              <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} className={inputClass}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className={labelClass}>Salary Range (INR / month)</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" min="0" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="Min (e.g. 15000)" className={inputClass} />
              <input type="number" min="0" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="Max (e.g. 35000)" className={inputClass} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location *</label>
            <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Pune, Maharashtra" className={inputClass} required />
          </div>

          {/* Deadline */}
          <div>
            <label className={labelClass}>
              Application Deadline <span className="text-purple-600 bg-purple-50 border border-purple-200/60 text-xs font-semibold px-2 py-0.5 rounded-md ml-1.5">(optional)</span>
            </label>
            <input type="date" value={form.deadline} min={new Date().toISOString().split("T")[0]} onChange={(e) => set("deadline", e.target.value)} className={inputClass} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-[2] rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 transition">
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Publishing...</span> : "Publish Vacancy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
