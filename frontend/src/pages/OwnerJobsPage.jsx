import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, ToggleLeft, Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import api from "../services/api";
import { SkeletonCard, ErrorState } from "../components/UIStates";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewed: "bg-blue-50 text-blue-700",
  shortlisted: "bg-violet-50 text-violet-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const ACTIONS = [
  { label: "Mark Reviewed", value: "reviewed", icon: Clock },
  { label: "Shortlist", value: "shortlisted", icon: CheckCircle },
  { label: "Hire", value: "hired", icon: CheckCircle },
  { label: "Reject", value: "rejected", icon: XCircle },
];

const ApplicantsPanel = ({ jobId }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/applications/job/${jobId}`)
      .then((r) => setApps(r.data.data || []))
      .catch((e) => setError(e.customMessage || "Failed to load applicants."))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status });
      setApps((prev) => prev.map((a) => a._id === appId ? { ...a, status: res.data.data.status } : a));
      toast.success(`Applicant marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;
  if (error) return <p className="text-red-500 text-sm py-4">{error}</p>;
  if (apps.length === 0) return <p className="text-slate-400 text-sm py-4">No applications yet.</p>;

  return (
    <div className="space-y-3 mt-3">
      {apps.map((app) => (
        <div key={app._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{app.barberId?.name || "Applicant"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{app.barberId?.email} · {app.experience} yrs exp</p>
            {app.coverLetter && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{app.coverLetter}</p>}
            {app.resume?.url && (
              <a href={app.resume.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">
                View Resume
              </a>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${STATUS_COLORS[app.status] || "bg-slate-100 text-slate-600"}`}>
              {app.status}
            </span>
            <div className="flex flex-col gap-1">
              {ACTIONS.filter((a) => a.value !== app.status).map((action) => (
                <button
                  key={action.value}
                  onClick={() => updateStatus(app._id, action.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const JobRow = ({ job, onToggle, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 truncate">{job.title}</h3>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${job.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {job.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{job.salon?.name} · {job.location}</p>
            <p className="text-sm text-slate-500 mt-0.5">{job.jobType} · {job.totalApplications} applicant{job.totalApplications !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onToggle(job._id, job.status)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5">
              <ToggleLeft className="w-3.5 h-3.5" />
              {job.status === "open" ? "Close" : "Reopen"}
            </button>
            <button onClick={() => onDelete(job._id)} className="rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition"
        >
          <Users className="w-4 h-4" />
          {expanded ? "Hide Applicants" : `View Applicants (${job.totalApplications})`}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-6 pb-6">
          <ApplicantsPanel jobId={job._id} />
        </div>
      )}
    </div>
  );
};

export default function OwnerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/jobs/owner/my");
      setJobs(res.data.data || []);
    } catch (err) {
      setError(err.customMessage || "Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleToggle = async (jobId, currentStatus) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/status`);
      setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, status: res.data.status } : j));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success("Job deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Vacancies</h1>
            <p className="mt-1 text-sm text-slate-500">Post openings, view applicants, and manage hiring decisions.</p>
          </div>
          <Link to="/jobs/post" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
            <Plus className="w-4 h-4" /> Post Vacancy
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 font-semibold mb-2">No vacancies posted yet</h3>
            <p className="text-slate-400 text-sm mb-6">Post your first job opening to start receiving applications from barbers.</p>
            <Link to="/jobs/post" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
              <Plus className="w-4 h-4" /> Post First Vacancy
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobRow key={job._id} job={job} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
