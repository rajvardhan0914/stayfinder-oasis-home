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
import Personal from "@/pages/Personal";
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

// Simple test component
const TestComponent = () => (
  <div className="min-h-screen bg-background p-8 animate-fade-in">
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-4">Test Page</h1>
      <p className="text-muted-foreground text-lg">This is a test page to check if routing works.</p>
    </div>
  </div>
);

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
          <Route path="/personal" element={<Personal />} />
          <Route path="/personal/help" element={<Help />} />
          <Route path="/personal/security" element={<PersonalSecurity />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/test" element={<TestComponent />} />
          <Route path="/help" element={<Help />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/properties/:id/edit" element={<EditProperty />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
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
