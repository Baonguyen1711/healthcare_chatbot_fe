import MedicationSchedule from "./pages/MedicationSchedule";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppointmentBooking from "./pages/AppointmentBooking";
import MedicationReminder from "./pages/MedicationReminder";
import HealthInformation from "./pages/HealthInformation";
import MedicalProcess from "./pages/MedicalProcess";
import FeedbackSurvey from "./pages/FeedbackSurvey";
import MultiChannel from "./pages/MultiChannel";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmForgotPassword from "./pages/ConfirmForgotPassword";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/appointment" element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>} />
          <Route path="/medication" element={
            <ProtectedRoute>
              <MedicationReminder />
            </ProtectedRoute>} />
          <Route path="/information" element={
            <ProtectedRoute>
              <HealthInformation />
            </ProtectedRoute>} />
          <Route path="/process" element={
            <ProtectedRoute>
              <MedicalProcess />
            </ProtectedRoute>} />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <FeedbackSurvey />
            </ProtectedRoute>} />
          <Route path="/multichannel" element={
            <ProtectedRoute>
              <MultiChannel />
            </ProtectedRoute>} />
          <Route path="/medication-schedule" element={<MedicationSchedule />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/confirm-forgot-password" element={<ConfirmForgotPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
