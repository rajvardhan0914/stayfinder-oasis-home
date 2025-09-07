import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PropertyDetail from "@/pages/PropertyDetail";
import Bookings from "@/pages/Bookings";
import Favorites from "@/pages/Favorites";
import Help from "@/pages/Help";
import PersonalSecurity from "@/pages/PersonalSecurity";
import { AddProperty } from "@/pages/AddProperty";
import NotFound from "@/pages/NotFound";
import EditProperty from './pages/EditProperty';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Profile from "@/pages/Profile";
import Contact from "@/pages/Contact";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/help" element={<Help />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/properties/:id/edit" element={<EditProperty />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/personal-security" element={<PersonalSecurity />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

const Toaster = () => {
  const { theme } = useTheme();
  return <SonnerToaster theme={theme as "light" | "dark" | "system" | undefined} position="top-right" />;
}

export default App;
