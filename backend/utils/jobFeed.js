import { createHash } from 'crypto';

const DEFAULT_THE_MUSE_API_URL = 'https://www.themuse.com/api/public/jobs';
const EXTERNAL_JOB_CATEGORY = 'Personal Care and Services';
const EXTERNAL_JOB_KEYWORDS = [
  'barber',
  'hair',
  'salon',
  'beauty',
  'stylist',
  'cosmetology',
  'cosmetologist',
  'esthetician',
  'aesthetician',
  'spa',
];

const MOCK_EXTERNAL_JOBS = [
  {
    id: 'mock-barber-01',
    title: 'Senior Barber',
    description: 'Hands-on barber role focused on fades, beard grooming, and premium client service.',
    skills: ['Barbering', 'Fade Cuts', 'Beard Trims', 'Client Consultation'],
    experience: 3,
    salary: { min: 42000, max: 56000, currency: 'USD' },
    location: 'Austin, TX',
    jobType: 'full-time',
    status: 'open',
    deadline: null,
    totalApplications: 0,
    createdAt: '2026-07-18T09:00:00.000Z',
    updatedAt: '2026-07-18T09:00:00.000Z',
    employer: {
      id: 'mock-barber-co-01',
      name: 'Blade & Bloom Studio',
      city: 'Austin',
      address: 'Austin, TX',
      logo: null,
      website: 'https://example.com/jobs/senior-barber',
    },
    applicationUrl: 'https://example.com/jobs/senior-barber',
    source: 'mock',
    sortDate: '2026-07-18T09:00:00.000Z',
  },
  {
    id: 'mock-stylist-02',
    title: 'Salon Stylist',
    description: 'A customer-facing stylist role for cutting, colouring, and event-ready styling.',
    skills: ['Hair Styling', 'Colouring', 'Blowouts', 'Retail Upselling'],
    experience: 2,
    salary: { min: 38000, max: 51000, currency: 'USD' },
    location: 'New York, NY',
    jobType: 'part-time',
    status: 'open',
    deadline: null,
    totalApplications: 0,
    createdAt: '2026-07-19T10:30:00.000Z',
    updatedAt: '2026-07-19T10:30:00.000Z',
    employer: {
      id: 'mock-salon-co-02',
      name: 'Velvet Strand Salon',
      city: 'New York',
      address: 'New York, NY',
      logo: null,
      website: 'https://example.com/jobs/salon-stylist',
    },
    applicationUrl: 'https://example.com/jobs/salon-stylist',
    source: 'mock',
    sortDate: '2026-07-19T10:30:00.000Z',
  },
  {
    id: 'mock-apprentice-03',
    title: 'Barber Apprentice',
    description: 'Entry-level apprenticeship with mentoring, training, and hands-on shop support.',
    skills: ['Sanitation', 'Tool Prep', 'Customer Care', 'Apprenticeship'],
    experience: 0,
    salary: { min: 28000, max: 34000, currency: 'USD' },
    location: 'Chicago, IL',
    jobType: 'internship',
    status: 'open',
    deadline: null,
    totalApplications: 0,
    createdAt: '2026-07-20T08:15:00.000Z',
    updatedAt: '2026-07-20T08:15:00.000Z',
    employer: {
      id: 'mock-barber-co-03',
      name: 'Northline Barbershop',
      city: 'Chicago',
      address: 'Chicago, IL',
      logo: null,
      website: 'https://example.com/jobs/barber-apprentice',
    },
    applicationUrl: 'https://example.com/jobs/barber-apprentice',
    source: 'mock',
    sortDate: '2026-07-20T08:15:00.000Z',
  },
];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toIsoDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createStableId = (...parts) =>
  createHash('sha1')
    .update(parts.map((part) => normalizeText(part).toLowerCase()).join('|'))
    .digest('hex');

const joinLocationParts = (parts) => parts.filter(Boolean).join(', ');

const extractLocation = (job) => {
  const locations = Array.isArray(job.locations) ? job.locations : [];
  const locationNames = locations
    .map((location) =>
      normalizeText(location?.name || location?.display_name || location?.location || location)
    )
    .filter(Boolean);

  return (
    normalizeText(job.location) ||
    normalizeText(job.locationsText) ||
    normalizeText(job.location_name) ||
    normalizeText(job.city) ||
    locationNames.join(' / ') ||
    'Location not specified'
  );
};

const extractCompany = (job) => {
  const company = job.company || {};
  return {
    id: normalizeText(company.id || job.company_id || job.companyId) || null,
    name:
      normalizeText(company.name) ||
      normalizeText(job.company_name) ||
      normalizeText(job.companyName) ||
      'Unknown Company',
    city: normalizeText(company.city) || '',
    address: normalizeText(company.location) || '',
    logo: normalizeText(company.logo) || normalizeText(company.logo_url) || null,
    website:
      normalizeText(company.website) ||
      normalizeText(job.refs?.landing_page) ||
      normalizeText(job.url) ||
      null,
  };
};

const extractSalary = (job) => {
  const compensation = job.compensation || job.salary || job.pay || null;
  if (!compensation) return null;

  if (typeof compensation === 'object') {
    const min = toNumber(
      compensation.min ?? compensation.minimum ?? compensation.low ?? compensation.lower
    );
    const max = toNumber(
      compensation.max ?? compensation.maximum ?? compensation.high ?? compensation.upper
    );
    const currency = normalizeText(compensation.currency || compensation.currency_code) || 'USD';
    if (min === null && max === null && !currency) return null;
    return { min, max, currency };
  }

  return null;
};

const mapExperienceLevel = (levels = []) => {
  const normalizedLevels = levels
    .map((level) => normalizeText(level?.name || level).toLowerCase())
    .filter(Boolean);

  if (normalizedLevels.some((level) => level.includes('intern'))) return 0;
  if (normalizedLevels.some((level) => level.includes('entry'))) return 0;
  if (normalizedLevels.some((level) => level.includes('mid'))) return 3;
  if (normalizedLevels.some((level) => level.includes('senior'))) return 5;
  if (normalizedLevels.some((level) => level.includes('management'))) return 8;
  return 0;
};

const mapJobType = (job) => {
  const rawType =
    normalizeText(job.employment_type) ||
    normalizeText(job.job_type) ||
    normalizeText(job.type) ||
    normalizeText(job.jobType) ||
    '';
  const normalizedType = rawType.toLowerCase();

  if (normalizedType.includes('part')) return 'part-time';
  if (normalizedType.includes('freelance') || normalizedType.includes('contract')) return 'freelance';
  if (normalizedType.includes('intern')) return 'internship';
  return 'full-time';
};

const extractDescription = (job) =>
  normalizeText(job.description) ||
  normalizeText(job.snippet) ||
  normalizeText(job.contents) ||
  normalizeText(job.summary) ||
  'No description provided.';

const extractApplicationUrl = (job) =>
  normalizeText(job.refs?.landing_page) ||
  normalizeText(job.apply_url) ||
  normalizeText(job.url) ||
  null;

const buildSearchText = (vacancy) =>
  [
    vacancy.title,
    vacancy.description,
    vacancy.location,
    vacancy.jobType,
    vacancy.employer?.name,
    ...(Array.isArray(vacancy.skills) ? vacancy.skills : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const normalizeJobTypeFilter = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (!normalizedValue) return null;
  if (normalizedValue.includes('part')) return 'part-time';
  if (normalizedValue.includes('freelance') || normalizedValue.includes('contract')) return 'freelance';
  if (normalizedValue.includes('intern')) return 'internship';
  if (normalizedValue.includes('full')) return 'full-time';
  return normalizedValue;
};

export const buildMongoJobQuery = (filters = {}) => {
  const query = { status: 'open' };

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  if (filters.location) {
    query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
  }

  if (filters.jobType) {
    query.jobType = filters.jobType;
  }

  if (filters.minExperience !== null && filters.minExperience !== undefined) {
    query.experience = { ...query.experience, $gte: filters.minExperience };
  }

  if (filters.maxExperience !== null && filters.maxExperience !== undefined) {
    query.experience = { ...query.experience, $lte: filters.maxExperience };
  }

  return query;
};

export const buildVacancyFilters = (query = {}) => ({
  keyword: normalizeText(query.keyword),
  location: normalizeText(query.location),
  jobType: normalizeJobTypeFilter(query.jobType),
  minExperience: toNumber(query.minExperience),
  maxExperience: toNumber(query.maxExperience),
  page: Math.max(1, toNumber(query.page) || 1),
  limit: Math.max(1, toNumber(query.limit) || 10),
});

export const normalizeLocalJob = (jobDoc) => {
  const job = typeof jobDoc?.toObject === 'function' ? jobDoc.toObject() : jobDoc;
  const salon = job?.salon && typeof job.salon === 'object' ? job.salon : {};
  const employerName = normalizeText(salon.name) || 'Local Salon';
  const location = normalizeText(job.location) || joinLocationParts([salon.city, salon.address]);
  const createdAt = toIsoDate(job.createdAt);

  return {
    id: `local:${job._id?.toString?.() || job.id}`,
    title: normalizeText(job.title),
    description: normalizeText(job.description),
    skills: Array.isArray(job.skills) ? job.skills : [],
    experience: toNumber(job.experience) ?? 0,
    salary: job.salary || null,
    location: location || 'Location not specified',
    jobType: normalizeJobTypeFilter(job.jobType) || 'full-time',
    status: normalizeText(job.status) || 'open',
    deadline: toIsoDate(job.deadline),
    totalApplications: toNumber(job.totalApplications) ?? 0,
    createdAt,
    updatedAt: toIsoDate(job.updatedAt),
    employer: {
      id: salon._id?.toString?.() || null,
      name: employerName,
      city: normalizeText(salon.city) || '',
      address: normalizeText(salon.address) || '',
      logo: Array.isArray(salon.images) && salon.images.length > 0 ? salon.images[0] : null,
      website: null,
    },
    salon: job.salon || null,
    createdBy: job.createdBy || null,
    applicationUrl: `/api/jobs/${job._id?.toString?.() || job.id}`,
    source: 'local',
    sortDate: createdAt,
  };
};

export const normalizeExternalJob = (job, source = 'themuse') => {
  const company = extractCompany(job);
  const title = normalizeText(job.name || job.title || job.job_title || job.position) || 'Untitled role';
  const description = extractDescription(job);
  const location = extractLocation(job);
  const applicationUrl = extractApplicationUrl(job);
  const createdAt = toIsoDate(job.publication_date || job.posted_at || job.created_at || job.updated_at);
  const rawId =
    normalizeText(job.id) ||
    normalizeText(job.job_id) ||
    normalizeText(job.refs?.landing_page) ||
    createStableId(title, company.name, location, applicationUrl || source);

  return {
    id: `${source}:${rawId}`,
    title,
    description,
    skills: Array.isArray(job.skills)
      ? job.skills.filter(Boolean).map((skill) => normalizeText(skill))
      : Array.isArray(job.tags)
        ? job.tags.filter(Boolean).map((tag) => normalizeText(tag))
        : [],
    experience: mapExperienceLevel(job.levels || job.experience_levels || []),
    salary: extractSalary(job),
    location,
    jobType: mapJobType(job),
    status: 'open',
    deadline: null,
    totalApplications: 0,
    createdAt,
    updatedAt: createdAt,
    employer: company,
    salon: null,
    createdBy: null,
    applicationUrl,
    source,
    sortDate: createdAt,
    remote: normalizeText(job.remote || job.flexible || job.remote_friendly).toLowerCase() === 'true',
  };
};

export const filterVacancies = (vacancies, filters = {}) => {
  const keyword = normalizeText(filters.keyword).toLowerCase();
  const location = normalizeText(filters.location).toLowerCase();
  const jobType = normalizeJobTypeFilter(filters.jobType);
  const minExperience = toNumber(filters.minExperience);
  const maxExperience = toNumber(filters.maxExperience);

  return vacancies.filter((vacancy) => {
    const text = buildSearchText(vacancy);

    if (keyword && !text.includes(keyword)) {
      return false;
    }

    if (location && !text.includes(location)) {
      return false;
    }

    if (jobType && vacancy.jobType !== jobType) {
      return false;
    }

    if (minExperience !== null && (toNumber(vacancy.experience) ?? 0) < minExperience) {
      return false;
    }

    if (maxExperience !== null && (toNumber(vacancy.experience) ?? 0) > maxExperience) {
      return false;
    }

    return true;
  });
};

export const mergeVacancies = (localVacancies = [], externalVacancies = []) => {
  const merged = [];
  const seen = new Set();

  const pushVacancy = (vacancy) => {
    const uniqueKey = [
      normalizeText(vacancy.title),
      normalizeText(vacancy.employer?.name),
      normalizeText(vacancy.location),
    ]
      .map((part) => part.toLowerCase())
      .join('|');

    if (seen.has(uniqueKey)) {
      return;
    }

    seen.add(uniqueKey);
    merged.push(vacancy);
  };

  localVacancies.forEach(pushVacancy);
  externalVacancies.forEach(pushVacancy);

  return merged.sort((left, right) => {
    const leftTime = new Date(left.sortDate || left.createdAt || 0).getTime();
    const rightTime = new Date(right.sortDate || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
};

export const paginateVacancies = (vacancies, page, limit) => {
  const pageNumber = Math.max(1, toNumber(page) || 1);
  const limitNumber = Math.max(1, toNumber(limit) || 10);
  const startIndex = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    total: vacancies.length,
    pages: Math.ceil(vacancies.length / limitNumber),
    data: vacancies.slice(startIndex, startIndex + limitNumber),
  };
};

const fetchJson = async (url, timeoutMs) => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch API is not available in this Node runtime');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    const bodyText = await response.text();
    let body = {};

    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        throw new Error('External jobs API returned invalid JSON');
      }
    }

    if (!response.ok) {
      const errorMessage =
        body?.error || body?.message || `External jobs API request failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
};

const buildMockExternalVacancies = (filters) => filterVacancies(MOCK_EXTERNAL_JOBS, filters);

const fetchMuseVacancies = async (filters) => {
  const apiUrl = process.env.THE_MUSE_API_URL || DEFAULT_THE_MUSE_API_URL;
  const apiKey = normalizeText(process.env.THE_MUSE_API_KEY);
  const timeoutMs = Math.max(1000, toNumber(process.env.THE_MUSE_TIMEOUT_MS) || 5000);
  const maxPages = Math.max(1, toNumber(process.env.THE_MUSE_MAX_PAGES) || 3);
  const collected = [];

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(apiUrl);
    url.searchParams.set('page', String(page));
    url.searchParams.set('descending', 'true');
    url.searchParams.set('category', EXTERNAL_JOB_CATEGORY);

    if (filters.location) {
      url.searchParams.set('location', filters.location);
    }

    if (apiKey) {
      url.searchParams.set('api_key', apiKey);
    }

    const payload = await fetchJson(url, timeoutMs);
    const results = Array.isArray(payload.results)
      ? payload.results
      : Array.isArray(payload.jobs)
        ? payload.jobs
        : [];

    if (results.length === 0) {
      break;
    }

    collected.push(...results.map((result) => normalizeExternalJob(result, 'themuse')));

    const pageCount = toNumber(payload.page_count);
    if (pageCount !== null && page + 1 >= pageCount) {
      break;
    }
  }

  return filterVacancies(collected, filters);
};

export const fetchExternalVacancies = async (filters = {}) => {
  try {
    const apiVacancies = await fetchMuseVacancies(filters);

    if (apiVacancies.length > 0) {
      return {
        source: 'themuse',
        vacancies: apiVacancies,
      };
    }

    return {
      source: 'mock',
      vacancies: buildMockExternalVacancies(filters),
    };
  } catch (error) {
    console.warn(`External jobs API unavailable, using mock feed: ${error.message}`);

    return {
      source: 'mock',
      vacancies: buildMockExternalVacancies(filters),
      error: error.message,
    };
  }
};

export const buildVacancyResponse = ({ localVacancies = [], externalVacancies = [], filters = {} }) => {
  const mergedVacancies = mergeVacancies(localVacancies, externalVacancies);
  const filteredVacancies = filterVacancies(mergedVacancies, filters);
  const paginated = paginateVacancies(filteredVacancies, filters.page, filters.limit);

  return {
    ...paginated,
    sourceCounts: {
      local: localVacancies.length,
      external: externalVacancies.length,
    },
    mergedCount: filteredVacancies.length,
    vacancies: paginated.data,
  };
};
