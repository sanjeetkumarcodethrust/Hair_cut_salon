import Job from '../models/Job.js';
import Salon from '../models/Salon.js';
import {
  buildMongoJobQuery,
  buildVacancyResponse,
  buildVacancyFilters,
  fetchExternalVacancies,
  normalizeLocalJob,
} from '../utils/jobFeed.js';
import { cacheGet, cacheSet } from '../utils/cache.js';

// ─── OWNER — Job CRUD ─────────────────────────────────────────────────────────

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private/Owner, Admin
export const createJob = async (req, res) => {
  try {
    const { title, salon, description, skills, experience, salary, location, jobType, deadline } =
      req.body;

    // Verify owner owns the salon
    const salonDoc = await Salon.findById(salon);
    if (!salonDoc) return res.status(404).json({ message: 'Salon not found' });

    if (
      salonDoc.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to post jobs for this salon' });
    }

    const job = await Job.create({
      title,
      salon,
      createdBy: req.user._id,
      description,
      skills,
      experience,
      salary,
      location,
      jobType,
      deadline,
      status: 'open',
    });

    const populated = await Job.findById(job._id)
      .populate('salon', 'name address city')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all jobs posted by the owner
// @route   GET /api/jobs/my
// @access  Private/Owner
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate('salon', 'name city')
      .sort('-createdAt');

    res.status(200).json({ count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a job
// @route   PUT /api/jobs/:id
// @access  Private/Owner, Admin
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('salon', 'name city')
      .populate('createdBy', 'name email');

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Owner, Admin
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close / Re-open a vacancy
// @route   PATCH /api/jobs/:id/status
// @access  Private/Owner, Admin
export const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = job.status === 'open' ? 'closed' : 'open';
    await job.save();

    res.status(200).json({
      message: `Job is now ${job.status}`,
      status: job.status,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── BARBER — Browse & Search Jobs ───────────────────────────────────────────

// @desc    Get all open jobs (with search, filter, pagination)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const filters = buildVacancyFilters(req.query);
    const query = buildMongoJobQuery(filters);
    const pageNum = filters.page;
    const limitNum = filters.limit;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('salon', 'name city images rating')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get open jobs merged with an external vacancy feed
// @route   GET /api/jobs/external
// @access  Public
export const getExternalJobs = async (req, res) => {
  try {
    const filters = buildVacancyFilters(req.query);
    const cacheKey = `external-jobs:${JSON.stringify(filters)}`;
    const cachedResponse = cacheGet(cacheKey);

    if (cachedResponse) {
      return res.status(200).json({ ...cachedResponse, cached: true });
    }

    const query = buildMongoJobQuery(filters);
    const [localJobs, externalFeed] = await Promise.all([
      Job.find(query)
        .populate('salon', 'name city address images rating')
        .populate('createdBy', 'name')
        .sort('-createdAt'),
      fetchExternalVacancies(filters),
    ]);

    const localVacancies = localJobs.map(normalizeLocalJob);
    const response = buildVacancyResponse({
      localVacancies,
      externalVacancies: externalFeed.vacancies,
      filters,
    });

    const payload = {
      success: true,
      cached: false,
      feedSource: externalFeed.source,
      warning: externalFeed.error ? 'External feed fell back to mock data.' : undefined,
      count: response.data.length,
      total: response.total,
      page: response.page,
      pages: response.pages,
      sourceCounts: response.sourceCounts,
      data: response.data,
    };

    if (!payload.warning) {
      delete payload.warning;
    }

    cacheSet(cacheKey, payload, Number(process.env.EXTERNAL_JOBS_CACHE_TTL_SECONDS) || 180);

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('salon', 'name city address images phone email rating')
      .populate('createdBy', 'name email');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
