import Appointment from '../models/Appointment.js';
import Application from '../models/Application.js';
import Favorite from '../models/Favorite.js';
import Review from '../models/Review.js';
import Salon from '../models/Salon.js';
import BarberProfile from '../models/BarberProfile.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const dashboardRoleLabels = {
  customer: 'Customer',
  barber: 'Barber',
  owner: 'Owner',
  admin: 'Admin',
};

const formatCurrency = (value, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

const formatMonthLabel = (value) => {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}-01T00:00:00.000Z`));
};

const formatDayLabel = (dateValue, timeValue) => {
  const dateLabel = formatDate(dateValue);
  return timeValue ? `${dateLabel} at ${timeValue}` : dateLabel;
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = (value = new Date()) => {
  const date = new Date(value);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const monthsBack = (count) => {
  const months = [];
  const current = new Date();
  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const month = new Date(current);
    month.setMonth(current.getMonth() - index);
    months.push(month.toISOString().slice(0, 7));
  }

  return months;
};

const buildSummaryCard = (label, value, detail, tone = 'slate') => ({
  label,
  value,
  detail,
  tone,
});

const buildSection = (title, items = [], emptyMessage = 'No items yet') => ({
  title,
  items,
  emptyMessage,
});

const sortByRecent = (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0);

const sortByDateAsc = (left, right) => {
  const leftDate = new Date(left.date || left.createdAt || 0).getTime();
  const rightDate = new Date(right.date || right.createdAt || 0).getTime();
  if (leftDate === rightDate) {
    return String(left.time || '').localeCompare(String(right.time || ''));
  }
  return leftDate - rightDate;
};

const countByGroup = async (model, match, field) => {
  const rows = await model.aggregate([
    { $match: match },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    label: String(row._id ?? 'Unknown'),
    value: row.count,
  }));
};

const sumPaidAppointments = async (match) => {
  const [row] = await Appointment.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$price', 0],
          },
        },
        paidCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0],
          },
        },
        refundedCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0],
          },
        },
      },
    },
  ]);

  return row || {
    revenue: 0,
    paidCount: 0,
    pendingCount: 0,
    refundedCount: 0,
  };
};

const monthlySeries = async (match, valueField = null, months = 6) => {
  const monthIds = monthsBack(months);
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        total: valueField ? { $sum: `$${valueField}` } : { $sum: 0 },
      },
    },
  ];

  const rows = await Appointment.aggregate(pipeline).catch(async () => []);
  const rowMap = new Map(rows.map((row) => [row._id, row]));

  return monthIds.map((monthId) => {
    const row = rowMap.get(monthId) || { count: 0, total: 0 };
    return {
      label: formatMonthLabel(monthId),
      count: row.count || 0,
      value: valueField ? row.total || 0 : row.count || 0,
    };
  });
};

const buildAppointmentItem = (appointment) => ({
  id: appointment._id.toString(),
  title: appointment.service?.name || 'Appointment',
  subtitle: [appointment.salon?.name, appointment.barber?.name].filter(Boolean).join(' � '),
  meta: formatDayLabel(appointment.rescheduleDate || appointment.date, appointment.rescheduleTime || appointment.time),
  value: formatCurrency(appointment.price),
  badge: appointment.status,
  href: '/appointments/' + appointment._id.toString(),
});

const buildFavoriteItem = (favorite) => {
  if (favorite.salon) {
    return {
      id: favorite._id.toString(),
      title: favorite.salon.name,
      subtitle: [favorite.salon.city, favorite.salon.address].filter(Boolean).join(' � '),
      meta: 'Salon',
      value: favorite.salon.rating ? String(favorite.salon.rating) + '/5' : 'Saved salon',
      badge: 'favorite',
      href: '/salons/' + favorite.salon._id.toString(),
    };
  }

  return {
    id: favorite._id.toString(),
    title: favorite.barber?.name || 'Saved barber',
    subtitle: [favorite.barber?.experience ? String(favorite.barber.experience) + ' yrs experience' : null, favorite.barber?.specialization?.[0]].filter(Boolean).join(' � '),
    meta: 'Barber',
    value: favorite.barber?.rating ? String(favorite.barber.rating) + '/5' : 'Saved barber',
    badge: 'favorite',
    href: '/barbers/' + favorite.barber?._id.toString(),
  };
};

const buildReviewItem = (review) => ({
  id: review._id.toString(),
  title: review.salon?.name || review.barber?.name || 'Review',
  subtitle: review.comment,
  meta: formatDate(review.createdAt),
  value: String(review.rating) + '/5',
  badge: 'review',
  href: '/reviews/' + review._id.toString(),
});

const buildJobItem = (job) => ({
  id: job._id.toString(),
  title: job.title,
  subtitle: [job.location, job.jobType].filter(Boolean).join(' � '),
  meta: job.status,
  value: formatNumber(job.totalApplications || 0) + ' applicants',
  badge: job.status,
  href: '/jobs/' + job._id.toString(),
});

const buildApplicationItem = (application) => ({
  id: application._id.toString(),
  title: application.jobId?.title || 'Job application',
  subtitle: application.jobId?.salon?.name || application.barberId?.name || '',
  meta: formatDate(application.createdAt),
  value: application.status,
  badge: application.status,
  href: '/applications/' + application._id.toString(),
});

const buildSalonItem = (salon) => ({
  id: salon._id.toString(),
  title: salon.name,
  subtitle: [salon.city, salon.state].filter(Boolean).join(' � '),
  meta: salon.address,
  value: salon.rating ? String(salon.rating) + '/5' : 'New',
  badge: 'salon',
  href: '/salons/' + salon._id.toString(),
});

const buildBarberItem = (barber) => ({
  id: barber._id.toString(),
  title: barber.name || barber.user?.name || 'Barber',
  subtitle: [barber.salonId?.name, barber.experience ? String(barber.experience) + ' yrs' : null].filter(Boolean).join(' � '),
  meta: barber.user?.email || 'No email',
  value: barber.rating ? String(barber.rating) + '/5' : 'No reviews',
  badge: 'barber',
  href: '/barbers/' + barber._id.toString(),
});

const buildUserItem = (user) => ({
  id: user._id.toString(),
  title: user.name,
  subtitle: user.email,
  meta: user.role,
  value: formatDate(user.createdAt),
  badge: user.role,
  href: '/users/' + user._id.toString(),
});

const getCustomerDashboard = async (userId) => {
  const today = startOfDay();
  const [upcomingAppointments, historyAppointments, favoriteSalons, favoriteBarbers, reviews, paidAppointments] = await Promise.all([
    Appointment.find({
      customer: userId,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('customer', 'name email phone')
      .populate('barber', 'name profilePhoto')
      .populate('salon', 'name address city phone email images')
      .sort({ date: 1, time: 1 })
      .limit(5),
    Appointment.find({
      customer: userId,
      $or: [{ date: { $lt: today } }, { status: { $in: ['completed', 'cancelled'] } }],
    })
      .populate('customer', 'name email phone')
      .populate('barber', 'name profilePhoto')
      .populate('salon', 'name address city phone email images')
      .sort({ date: -1, time: -1 })
      .limit(5),
    Favorite.find({ customer: userId, salon: { $exists: true, $ne: null } })
      .populate('salon', 'name address city state images rating totalReviews phone')
      .sort({ createdAt: -1 })
      .limit(5),
    Favorite.find({ customer: userId, barber: { $exists: true, $ne: null } })
      .populate('barber', 'name profilePhoto specialization experience rating totalReviews salonId')
      .sort({ createdAt: -1 })
      .limit(5),
    Review.find({ customer: userId })
      .populate('salon', 'name city')
      .populate('barber', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5),
    Appointment.find({ customer: userId, paymentStatus: 'paid' })
      .populate('barber', 'name profilePhoto')
      .populate('salon', 'name city')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const totals = await sumPaidAppointments({ customer: userId });
  const favoriteItems = [...favoriteSalons, ...favoriteBarbers].sort(sortByRecent).map(buildFavoriteItem);

  return {
    summary: [
      buildSummaryCard('Upcoming', upcomingAppointments.length, 'Next visits booked', 'blue'),
      buildSummaryCard('Spent', formatCurrency(totals.revenue), 'Total paid appointments', 'emerald'),
      buildSummaryCard('Favorites', favoriteItems.length, 'Saved salons and barbers', 'amber'),
      buildSummaryCard('Reviews', reviews.length, 'Reviews you left', 'violet'),
    ],
    sections: {
      upcomingAppointments: buildSection('Upcoming appointments', upcomingAppointments.map(buildAppointmentItem), 'No upcoming appointments yet.'),
      history: buildSection('History', historyAppointments.map(buildAppointmentItem), 'No appointment history yet.'),
      favorites: buildSection('Favorites', favoriteItems, 'No favorites saved yet.'),
      reviews: buildSection('Reviews', reviews.map(buildReviewItem), 'No reviews submitted yet.'),
      payments: buildSection('Payments', paidAppointments.map(buildAppointmentItem), 'No payments recorded yet.'),
    },
  };
};

const getBarberDashboard = async (userId) => {
  const barberProfile = await BarberProfile.findOne({ user: userId }).populate('salonId', 'name city address');
  const barberId = barberProfile?._id;
  const [schedule, reviews, applications, paidAppointments, monthlyRevenue] = await Promise.all([
    barberId
      ? Appointment.find({
          barber: barberId,
          date: { $gte: startOfDay() },
          status: { $in: ['pending', 'confirmed'] },
        })
          .populate('customer', 'name email phone profileImage')
          .populate('salon', 'name city address images')
          .sort({ date: 1, time: 1 })
          .limit(7)
      : [],
    barberId
      ? Review.find({ barber: barberId })
          .populate('customer', 'name profileImage')
          .populate('salon', 'name city')
          .sort({ createdAt: -1 })
          .limit(5)
      : [],
    Application.find({ barberId: userId })
      .populate({
        path: 'jobId',
        select: 'title salary location jobType status deadline createdAt totalApplications',
        populate: { path: 'salon', select: 'name city images' },
      })
      .sort({ createdAt: -1 })
      .limit(5),
    barberId
      ? Appointment.find({ barber: barberId, paymentStatus: 'paid' })
          .populate('salon', 'name city')
          .sort({ createdAt: -1 })
          .limit(5)
      : [],
    barberId
      ? monthlySeries({ barber: barberId, paymentStatus: 'paid' }, 'price', 6)
      : [],
  ]);

  const earnings = await sumPaidAppointments({ barber: barberId });

  const availabilityItems = barberProfile
    ? Object.entries(barberProfile.availability || {}).map(([day, value]) => ({
        id: day,
        title: day.charAt(0).toUpperCase() + day.slice(1),
        subtitle: value?.isWorking ? 'Working' : 'Off',
        meta: value?.start && value?.end ? value.start + ' - ' + value.end : 'No shift set',
        value: value?.isWorking ? 'Available' : 'Unavailable',
        badge: value?.isWorking ? 'open' : 'closed',
      }))
    : [];

  return {
    summary: [
      buildSummaryCard('Schedule', schedule.length, 'Upcoming client bookings', 'blue'),
      buildSummaryCard('Earnings', formatCurrency(earnings.revenue), 'Paid appointments', 'emerald'),
      buildSummaryCard('Reviews', reviews.length, 'Client reviews received', 'amber'),
      buildSummaryCard('Applications', applications.length, 'Job applications submitted', 'violet'),
    ],
    sections: {
      schedule: buildSection('Schedule', schedule.map(buildAppointmentItem), 'No upcoming appointments scheduled.'),
      earnings: buildSection(
        'Earnings',
        monthlyRevenue.map((row) => ({
          id: row.label,
          title: row.label,
          subtitle: formatNumber(row.count) + ' paid appointments',
          meta: 'Monthly revenue',
          value: formatCurrency(row.value),
          badge: 'earnings',
        })),
        'No earnings recorded yet.'
      ),
      reviews: buildSection('Reviews', reviews.map(buildReviewItem), 'No reviews yet.'),
      jobApplications: buildSection('Job applications', applications.map(buildApplicationItem), 'No job applications yet.'),
      availability: buildSection('Availability', availabilityItems, 'No availability set yet.'),
    },
  };
};

const getOwnerDashboard = async (userId) => {
  const salons = await Salon.find({ owner: userId }).sort({ createdAt: -1 });
  const salonIds = salons.map((salon) => salon._id);
  const jobs = await Job.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(8);
  const jobIds = jobs.map((job) => job._id);

  const [staff, bookings, applications, monthlyRevenue, revenueBySalon] = await Promise.all([
    salonIds.length
      ? BarberProfile.find({ salonId: { $in: salonIds } })
          .populate('user', 'name email profileImage')
          .populate('salonId', 'name city')
          .sort({ createdAt: -1 })
      : [],
    salonIds.length
      ? Appointment.find({ salon: { $in: salonIds } })
          .populate('customer', 'name email phone')
          .populate('barber', 'name profilePhoto')
          .populate('salon', 'name city address images')
          .sort({ date: -1, time: -1 })
          .limit(10)
      : [],
    jobIds.length
      ? Application.find({ jobId: { $in: jobIds } })
          .populate({
            path: 'jobId',
            select: 'title location jobType status totalApplications',
            populate: { path: 'salon', select: 'name city' },
          })
          .populate('barberId', 'name email profileImage')
          .sort({ createdAt: -1 })
          .limit(10)
      : [],
    salonIds.length
      ? monthlySeries({ salon: { $in: salonIds }, paymentStatus: 'paid' }, 'price', 6)
      : [],
    salonIds.length
      ? Appointment.aggregate([
          { $match: { salon: { $in: salonIds }, paymentStatus: 'paid' } },
          {
            $group: {
              _id: '$salon',
              revenue: { $sum: '$price' },
              bookings: { $sum: 1 },
            },
          },
        ])
      : [],
  ]);

  const bookingTotals = await sumPaidAppointments({ salon: { $in: salonIds } });
  const bookingStatusCounts = salonIds.length
    ? await countByGroup(Appointment, { salon: { $in: salonIds } }, 'status')
    : [];
  const jobStatusCounts = await countByGroup(Job, { createdBy: userId }, 'status');

  const revenueBySalonItems = revenueBySalon.map((entry) => {
    const salon = salons.find((salonItem) => salonItem._id.toString() === entry._id.toString());
    return {
      id: entry._id.toString(),
      title: salon?.name || 'Salon',
      subtitle: salon?.city || salon?.address || 'Salon revenue',
      meta: formatNumber(entry.bookings) + ' paid bookings',
      value: formatCurrency(entry.revenue),
      badge: 'revenue',
      href: '/salons/' + entry._id.toString(),
    };
  });

  return {
    summary: [
      buildSummaryCard('Salons', salons.length, 'Owned locations', 'blue'),
      buildSummaryCard('Staff', staff.length, 'Active barbers', 'emerald'),
      buildSummaryCard('Revenue', formatCurrency(bookingTotals.revenue), 'Paid salon bookings', 'amber'),
      buildSummaryCard('Bookings', bookings.length, 'Recent bookings', 'violet'),
    ],
    sections: {
      salons: buildSection('Salons', salons.map(buildSalonItem), 'No salons registered yet.'),
      staff: buildSection('Staff', staff.map(buildBarberItem), 'No staff assigned yet.'),
      revenue: buildSection(
        'Revenue',
        revenueBySalonItems.length > 0
          ? revenueBySalonItems
          : monthlyRevenue.map((row) => ({
              id: row.label,
              title: row.label,
              subtitle: formatNumber(row.count) + ' paid bookings',
              meta: 'Monthly revenue',
              value: formatCurrency(row.value),
              badge: 'revenue',
            })),
        'No revenue recorded yet.'
      ),
      bookings: buildSection('Bookings', bookings.map(buildAppointmentItem), 'No bookings found yet.'),
      jobs: buildSection('Jobs', jobs.map(buildJobItem), 'No jobs posted yet.'),
      applicants: buildSection('Applicants', applications.map(buildApplicationItem), 'No applicants yet.'),
      reports: buildSection(
        'Reports',
        bookingStatusCounts.concat(jobStatusCounts).map((item) => ({
          id: item.label,
          title: item.label,
          subtitle: 'Count summary',
          meta: 'Status report',
          value: formatNumber(item.value),
          badge: 'report',
        })),
        'No reports available yet.'
      ),
    },
  };
};

const getAdminDashboard = async () => {
  const [users, salons, barbers, bookings, jobs, applications, reviews, userRoles, bookingStatuses, applicationStatuses, revenueSeries, recentUsers] = await Promise.all([
    User.countDocuments(),
    Salon.countDocuments(),
    BarberProfile.countDocuments(),
    Appointment.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Review.countDocuments(),
    countByGroup(User, {}, 'role'),
    countByGroup(Appointment, {}, 'status'),
    countByGroup(Application, {}, 'status'),
    monthlySeries({ paymentStatus: 'paid' }, 'price', 6),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role profileImage createdAt'),
  ]);

  const topSalons = await Salon.find().sort({ rating: -1, totalReviews: -1 }).limit(5);
  const topBarbers = await BarberProfile.find().sort({ rating: -1, totalReviews: -1 }).limit(5).populate('user', 'name email profileImage').populate('salonId', 'name city');

  return {
    summary: [
      buildSummaryCard('Users', users, 'Registered accounts', 'blue'),
      buildSummaryCard('Salons', salons, 'Salon records', 'emerald'),
      buildSummaryCard('Barbers', barbers, 'Barber profiles', 'amber'),
      buildSummaryCard('Bookings', bookings, 'All appointments', 'violet'),
    ],
    sections: {
      users: buildSection('Users', [
        ...userRoles.map((item) => ({
          id: item.label,
          title: item.label,
          subtitle: 'Account role',
          meta: 'Users by role',
          value: formatNumber(item.value),
          badge: 'user',
        })),
        ...recentUsers.map(buildUserItem),
      ], 'No users available yet.'),
      salons: buildSection('Salons', topSalons.map(buildSalonItem), 'No salons available yet.'),
      barbers: buildSection('Barbers', topBarbers.map(buildBarberItem), 'No barbers available yet.'),
      reports: buildSection(
        'Reports',
        bookingStatuses
          .concat(applicationStatuses)
          .concat([
            { label: 'Appointments', value: bookings },
            { label: 'Jobs', value: jobs },
            { label: 'Applications', value: applications },
            { label: 'Reviews', value: reviews },
          ])
          .map((item) => ({
            id: item.label,
            title: item.label,
            subtitle: 'Platform report',
            meta: 'Admin overview',
            value: formatNumber(item.value),
            badge: 'report',
          })),
        'No reports available yet.'
      ),
      analytics: buildSection(
        'Analytics',
        revenueSeries.map((row) => ({
          id: row.label,
          title: row.label,
          subtitle: formatNumber(row.count) + ' paid bookings',
          meta: 'Monthly revenue',
          value: formatCurrency(row.value),
          badge: 'analytics',
        })),
        'No analytics available yet.'
      ),
    },
  };
};

export const getDashboardOverview = async (req, res) => {
  try {
    const role = req.user.role;
    let dashboard;

    if (role === 'customer') {
      dashboard = await getCustomerDashboard(req.user._id);
    } else if (role === 'barber') {
      dashboard = await getBarberDashboard(req.user._id);
    } else if (role === 'owner') {
      dashboard = await getOwnerDashboard(req.user._id);
    } else {
      dashboard = await getAdminDashboard();
    }

    res.status(200).json({
      role,
      roleLabel: dashboardRoleLabels[role] || 'Dashboard',
      generatedAt: new Date().toISOString(),
      ...dashboard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
