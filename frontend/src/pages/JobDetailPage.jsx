import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Clock, IndianRupee, Users, ChevronLeft, Loader2, Upload, X } from "lucide-react";
import api from "../services/api";
import { ErrorState } from "../components/UIStates";
import toast from "react-hot-toast";

const Skeleton = ({ className }) => <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply form
  const [showApply, setShowApply] = useState(false);
  const [experience, setExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setError(err.customMessage || "Failed to load job.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile) { toast.error("Please upload your resume (PDF)."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("experience", experience);
      fd.append("coverLetter", coverLetter);
      await api.post(`/applications/${id}/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted successfully!");
      setShowApply(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.customMessage || "Application failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  if (error) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;

  if (!job) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/jobs")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <p className="mt-1 text-slate-600 font-medium">{job.salon?.name}</p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${job.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {job.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{job.location}</span>}
            {job.jobType && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" />{job.jobType}</span>}
            {job.salary?.min && (
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-slate-400" />
                {job.salary.min.toLocaleString()}{job.salary.max ? ` – ${job.salary.max.toLocaleString()}` : "+"}
                {job.salary.currency ? ` ${job.salary.currency}/mo` : ""}
              </span>
            )}
            {job.experience > 0 && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{job.experience}+ years experience</span>}
            {job.totalApplications > 0 && <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" />{job.totalApplications} applicants</span>}
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Skills Required</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span key={s} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Job Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.deadline && (
            <p className="mt-4 text-xs text-slate-400">
              Application deadline: {new Date(job.deadline).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          )}

          {job.status === "open" && !showApply && (
            <button
              onClick={() => setShowApply(true)}
              className="mt-8 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              Apply for this Position
            </button>
          )}

          {/* Apply Form */}
          {showApply && (
            <form onSubmit={handleApply} className="mt-8 space-y-5 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Submit Application</h2>
                <button type="button" onClick={() => setShowApply(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF) *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 hover:border-primary transition"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    {resumeFile ? resumeFile.name : "Click to upload your resume (PDF, max 5MB)"}
                  </span>
                </div>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover Letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell the employer why you are a great fit..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="mt-1 text-xs text-slate-400 text-right">{coverLetter.length}/1000</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApply(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-[2] rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 transition">
                  {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting...</span> : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
