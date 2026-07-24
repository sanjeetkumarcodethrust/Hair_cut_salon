import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import {
  LandingPage,
  SearchSalons,
  SearchBarbers,
  SalonDetails,
  BarberProfile,
  BookingPage,
  JobsPage,
  ApplyJobPage,
  CustomerDashboardPage,
  BarberDashboardPage,
  OwnerDashboardPage,
  AdminDashboardPage,
  ProfilePage,
  SettingsPage,
  NotificationsPage,
} from '../pages/UiPages.jsx';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="landing" element={<LandingPage />} />
        <Route path="salons" element={<SearchSalons />} />
        <Route path="salons/:id" element={<SalonDetails />} />
        <Route path="barbers" element={<SearchBarbers />} />
        <Route path="barbers/:id" element={<BarberProfile />} />
        <Route path="bookings/new" element={<BookingPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/apply" element={<ApplyJobPage />} />
        <Route path="customer-dashboard" element={<CustomerDashboardPage />} />
        <Route path="barber-dashboard" element={<BarberDashboardPage />} />
        <Route path="owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
