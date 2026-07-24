import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const panelClasses = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70';

const quickLinks = [
  { title: 'Find salons', href: '/salons' },
  { title: 'Meet barbers', href: '/barbers' },
  { title: 'Browse jobs', href: '/jobs' },
];

const salonCards = [
  { name: 'Luxe Cuts Studio', location: 'Downtown', rating: '4.9', info: 'Haircuts • Beard trims • Blowouts' },
  { name: 'The Barber House', location: 'Midtown', rating: '4.8', info: 'Classic cuts • Razor designs' },
  { name: 'Glow Salon', location: 'Riverside', rating: '4.7', info: 'Color • Styling • Bridal' },
];

const barberCards = [
  { name: 'Asha Rivera', specialty: 'Precision fades', rating: '4.9' },
  { name: 'Mikel Brooks', specialty: 'Luxury styling', rating: '4.8' },
  { name: 'Jade Chen', specialty: 'Color correction', rating: '4.7' },
];

const jobCards = [
  { title: 'Senior Stylist', salon: 'Luxe Cuts Studio', location: 'Downtown', type: 'Full-time' },
  { title: 'Barber Assistant', salon: 'The Barber House', location: 'Midtown', type: 'Part-time' },
  { title: 'Salon Receptionist', salon: 'Glow Salon', location: 'Riverside', type: 'Contract' },
];

const metrics = [
  { label: 'Upcoming bookings', value: '12' },
  { label: 'Saved favorites', value: '7' },
  { label: 'Reviews submitted', value: '4' },
];

export const LandingPage = () => (
  <PageShell
    eyebrow="Salon booking platform"
    title="Book salons, barbers, and jobs from one modern experience"
    description="The new UI flow gives customers a fast booking experience while helping salons and barbers manage appointments and opportunities in one place."
    actions={quickLinks.map((link) => (
      <Link key={link.title} to={link.href} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        {link.title}
      </Link>
    ))}
  >
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Welcome to your salon marketplace</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Customers can browse services, book appointments, and track favorites. Salon owners can review bookings and post new jobs. Barbers can update their profile and manage requests.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 space-y-3">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.href} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <span>{link.title}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </PageShell>
);

export const SearchSalons = () => (
  <PageShell
    eyebrow="Discover salons"
    title="Search salons nearby"
    description="Use the search experience to compare salons by rating, location, and service type."
  >
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Filter options</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">Location: Downtown or Midtown</div>
          <div className="rounded-2xl bg-slate-50 p-4">Service: Haircuts, styling, color</div>
          <div className="rounded-2xl bg-slate-50 p-4">Availability: Today or tomorrow</div>
        </div>
      </div>
      <div className="space-y-4">
        {salonCards.map((salon) => (
          <div key={salon.name} className={panelClasses}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{salon.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{salon.location}</p>
                <p className="mt-2 text-sm text-slate-500">{salon.info}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-semibold text-slate-900">★ {salon.rating}</p>
                <Link to="/salons/1" className="mt-2 inline-flex text-sm font-medium text-primary">View details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </PageShell>
);

export const SearchBarbers = () => (
  <PageShell
    eyebrow="Meet talented barbers"
    title="Search barbers by specialty"
    description="Find barbers who match your style, service, and availability."
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {barberCards.map((barber) => (
        <div key={barber.name} className={panelClasses}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{barber.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{barber.specialty}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">★ {barber.rating}</span>
          </div>
          <Link to="/barbers/1" className="mt-5 inline-flex text-sm font-semibold text-primary">View profile</Link>
        </div>
      ))}
    </div>
  </PageShell>
);

export const SalonDetails = () => (
  <PageShell
    eyebrow="Salon overview"
    title="Luxe Cuts Studio"
    description="A premium salon experience with advanced styling, beard care, and premium appointments."
  >
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">About this salon</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">This location specializes in precision haircuts, styling, and beard grooming. Open daily with flexible booking slots for walk-ins and pre-booked consultations.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Address</p>
            <p className="mt-1 text-sm text-slate-600">210 Market Street, Downtown</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Opening hours</p>
            <p className="mt-1 text-sm text-slate-600">Mon–Sat • 9:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Popular services</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Signature haircut — $45</li>
          <li className="rounded-2xl bg-slate-50 p-3">Beard shaping — $25</li>
          <li className="rounded-2xl bg-slate-50 p-3">Blowout styling — $35</li>
        </ul>
        <Link to="/bookings/new" className="mt-5 inline-flex text-sm font-semibold text-primary">Book now</Link>
      </div>
    </div>
  </PageShell>
);

export const BarberProfile = () => (
  <PageShell
    eyebrow="Barber profile"
    title="Asha Rivera"
    description="Trusted for clean fades, modern styling, and a relaxed consultation experience."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">About the barber</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Asha has over eight years of experience working with clients who want polished, versatile looks. She is especially known for sharp fades and tailored grooming guidance.</p>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Services</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Skin fade — $40</li>
          <li className="rounded-2xl bg-slate-50 p-3">Classic cut — $35</li>
          <li className="rounded-2xl bg-slate-50 p-3">Hot towel shave — $30</li>
        </ul>
      </div>
    </div>
  </PageShell>
);

export const BookingPage = () => (
  <PageShell
    eyebrow="Book appointment"
    title="Schedule your visit"
    description="Choose your preferred salon, service, and time slot to confirm your booking."
  >
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Booking details</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">Salon: Luxe Cuts Studio</div>
          <div className="rounded-2xl bg-slate-50 p-4">Service: Signature haircut</div>
          <div className="rounded-2xl bg-slate-50 p-4">Time: Friday • 4:30 PM</div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Confirm booking</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Your booking will be reserved instantly and added to your dashboard for reminders and updates.</p>
        <button className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Reserve appointment</button>
      </div>
    </div>
  </PageShell>
);

export const JobsPage = () => (
  <PageShell
    eyebrow="Careers"
    title="Open jobs and opportunities"
    description="Explore salon and barber roles that match your skills and ambitions."
  >
    <div className="space-y-4">
      {jobCards.map((job) => (
        <div key={job.title} className={panelClasses}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{job.salon} • {job.location}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-slate-900">{job.type}</p>
              <Link to="/jobs/apply" className="mt-2 inline-flex text-sm font-medium text-primary">Apply now</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </PageShell>
);

export const ApplyJobPage = () => (
  <PageShell
    eyebrow="Job application"
    title="Apply for a role"
    description="Share your experience and availability so the salon can review your application quickly."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Application form</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">Role: Senior Stylist</div>
          <div className="rounded-2xl bg-slate-50 p-4">Experience: 5+ years</div>
          <div className="rounded-2xl bg-slate-50 p-4">Availability: Immediate</div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Next step</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Once submitted, your application will be visible to the salon owner and you can track its status from your dashboard.</p>
        <button className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Submit application</button>
      </div>
    </div>
  </PageShell>
);

export const CustomerDashboardPage = () => (
  <PageShell eyebrow="Customer dashboard" title="Your appointments and favorites" description="Stay on top of bookings, saved salons, and follow-up reminders.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['Upcoming haircut', 'Saved salon', 'Review due'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This section is ready for live customer data and notifications.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const BarberDashboardPage = () => (
  <PageShell eyebrow="Barber dashboard" title="Manage your day" description="Track bookings, availability, and client requests from a single place.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {["Today's bookings", 'Open requests', 'Weekly earnings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This page can be connected to your barber workflow and calendar.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const OwnerDashboardPage = () => (
  <PageShell eyebrow="Owner dashboard" title="Run your salon operations" description="Monitor staff activity, revenue, and incoming bookings without leaving the platform.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const AdminDashboardPage = () => (
  <PageShell eyebrow="Admin dashboard" title="Platform oversight" description="Review users, salons, barbers, and reports from a central administration view.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['User management', 'Salon approvals', 'Reports center'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This dashboard can be connected to the admin backend when ready.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const ProfilePage = () => (
  <PageShell eyebrow="Profile" title="Your public profile" description="Manage your personal details and share a polished profile with clients or salons.">
    <div className={panelClasses}>
      <h2 className="text-lg font-semibold text-slate-900">Profile overview</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-4">Name: Jordan Lee</div>
        <div className="rounded-2xl bg-slate-50 p-4">Email: jordan@example.com</div>
        <div className="rounded-2xl bg-slate-50 p-4">Role: Customer</div>
      </div>
    </div>
  </PageShell>
);

export const SettingsPage = () => (
  <PageShell eyebrow="Settings" title="Preferences and account settings" description="Adjust notifications, privacy, and account details for your experience.">
    <div className={panelClasses}>
      <h2 className="text-lg font-semibold text-slate-900">Account preferences</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-4">Email reminders: Enabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">SMS alerts: Disabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">Privacy mode: Standard</div>
      </div>
    </div>
  </PageShell>
);

export const NotificationsPage = () => (
  <PageShell eyebrow="Notifications" title="Recent updates" description="Review appointment reminders, new offers, and job status changes.">
    <div className="space-y-4">
      {['Your booking is confirmed', 'A new job match is available', 'A salon sent you a reminder'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">Notifications are ready for live event-driven content.</p>
        </div>
      ))}
    </div>
  </PageShell>
);
