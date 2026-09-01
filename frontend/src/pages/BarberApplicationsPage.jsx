import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, ChevronRight } from "lucide-react";
import api from "../services/api";
import { SkeletonCard, ErrorState } from "../components/UIStates";

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewed: "bg-blue-50 text-blue-700",
  shortlisted: "bg-violet-50 text-violet-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function BarberApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applications/my");
      setApps(res.data.data || []);
    } catch (err) {
      setError(err.customMessage || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
            <p className="mt-1 text-sm text-slate-500">Track the status of your job applications.</p>
          </div>
          <Link to="/jobs" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
            Browse Jobs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchApps} />
        ) : apps.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 font-semibold mb-2">No applications yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start applying to barber vacancies posted by salon owners.</p>
            <Link to="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Browse Vacancies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {app.jobId?.title || "Job Title"}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">
                      {app.jobId?.salon?.name || "Salon"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {app.jobId?.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.jobId.location}</span>
                      )}
                      {app.jobId?.jobType && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.jobId.jobType}</span>
                      )}
                      {app.experience !== undefined && app.experience !== null && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-500" /> {app.experience} {app.experience === 1 ? 'year' : 'years'} experience
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[app.status] || "bg-slate-100 text-slate-600"}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.coverLetter && (
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Your Submitted Cover Letter:</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{app.coverLetter}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  {app.resume?.url && (
                    <a href={app.resume.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary underline">
                      View Resume
                    </a>
                  )}
                  {app.jobId?._id && (
                    <Link to={`/jobs/${app.jobId._id}`} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition">
                      View Job Listing →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
