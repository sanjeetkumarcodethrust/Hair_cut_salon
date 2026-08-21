import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, IndianRupee, Search } from "lucide-react";
import api from "../services/api";
import { SkeletonCard, ErrorState } from "../components/UIStates";

const JOB_TYPES = ["", "full-time", "part-time", "freelance", "internship"];

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

const jobTypeBadgeColor = (t) =>
  ({ "full-time": "green", "part-time": "blue", freelance: "purple", internship: "orange" }[t] || "slate");

const JobCard = ({ job }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-slate-900 truncate">{job.title}</h3>
        <p className="mt-1 text-sm text-slate-600 font-medium">{job.salon?.name || "Salon"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {job.jobType && <Badge color={jobTypeBadgeColor(job.jobType)}>{job.jobType}</Badge>}
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {job.salary?.min && (
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-0.5 justify-end">
            <IndianRupee className="w-3.5 h-3.5" />
            {job.salary.min.toLocaleString()}
            {job.salary.max ? `-${job.salary.max.toLocaleString()}` : "+"}
          </p>
        )}
        {job.experience > 0 && <p className="text-xs text-slate-500 mt-1">{job.experience}+ yrs exp</p>}
      </div>
    </div>
    {job.skills?.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 5).map((s) => (
          <span key={s} className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">
            {s}
          </span>
        ))}
        {job.skills.length > 5 && <span className="text-xs text-slate-400">+{job.skills.length - 5} more</span>}
      </div>
    )}
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        {job.totalApplications > 0 && ` · ${job.totalApplications} applied`}
      </div>
      <Link
        to={`/jobs/${job._id}`}
        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
      >
        View & Apply
      </Link>
    </div>
  </div>
);

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 9 };
      if (search) params.search = search;
      if (jobType) params.jobType = jobType;
      if (location) params.location = location;
      const res = await api.get("/jobs", { params });
      setJobs(res.data.data || []);
      setPage(res.data.page || p);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.customMessage || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Careers
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Open Barber Vacancies</h1>
          <p className="mt-2 text-slate-500 text-sm">
            {total > 0 ? `${total} job${total !== 1 ? "s" : ""} available` : "Find your next opportunity"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Location or city..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t ? t.charAt(0).toUpperCase() + t.slice(1) : "All types"}
              </option>
            ))}
          </select>
          <button type="submit" className="sm:col-span-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
            Search Jobs
          </button>
        </form>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchJobs(page)} />
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No vacancies found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        )}

        {!loading && !error && pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <button disabled={page <= 1} onClick={() => fetchJobs(page - 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">
              Previous
            </button>
            <span className="text-slate-600">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => fetchJobs(page + 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
