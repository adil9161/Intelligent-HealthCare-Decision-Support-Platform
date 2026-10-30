import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardShell } from './components/layout/DashboardShell';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { PatientList } from './components/patient/PatientList';
import { PatientFormModal } from './components/patient/PatientFormModal';
import { PatientDetailDrawer } from './components/patient/PatientDetailDrawer';
import { StaffList } from './components/staff/StaffList';
import { StaffFormModal } from './components/staff/StaffFormModal';
import { ResourceDashboard } from './components/resource/ResourceDashboard';
import { TriageConsultationStudio } from './components/ai/TriageConsultationStudio';
import { SearchAlgorithmVisualizer } from './components/ai/SearchAlgorithmVisualizer';
import { HospitalDigitalTwin } from './components/3d/HospitalDigitalTwin';
import { SdgImpactSection } from './components/sdg/SdgImpactSection';
import { SettingsPage } from './components/settings/SettingsPage';

import { patientService } from './services/patientService';
import { staffService } from './services/staffService';
import { resourceService } from './services/resourceService';
import { Patient, Staff, Resource, ResourceSummary, PatientStatus } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionExpired, clearSessionExpiredToast } = useAuth();

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceSummary, setResourceSummary] = useState<ResourceSummary | null>(null);

  // Modals & Drawers
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [pts, stf, res, sum] = await Promise.all([
        patientService.getPatients(),
        staffService.getStaffMembers(),
        resourceService.getResources(),
        resourceService.getSummary(),
      ]);
      setPatients(pts);
      setStaffList(stf);
      setResources(res);
      setResourceSummary(sum);
    } catch (err: any) {
      console.error('Failed to load platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsPatientModalOpen(false);
        setIsStaffModalOpen(false);
        setSelectedPatient(null);
      } else if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      } else {
        if (e.key === '0') navigate('/dashboard');
        else if (e.key === '1') navigate('/patients');
        else if (e.key === '2') navigate('/staff');
        else if (e.key === '3') navigate('/resources');
        else if (e.key === '4') navigate('/triage');
        else if (e.key === '5') navigate('/search');
        else if (e.key === '6') navigate('/digital-twin');
        else if (e.key === '7') navigate('/sdg');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handlers for Patients
  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      const created = await patientService.createPatient(patientData);
      setPatients((prev) => [created, ...prev]);
      setSelectedPatient(created); // Open slide-over recommendation panel with animated count-up
      showToast(`Patient ${created.name} (${created.patient_id}) admitted with AI decision passport.`);
      resourceService.getSummary().then(setResourceSummary);
    } catch (err: any) {
      alert(`Error creating patient: ${err.message}`);
    }
  };

  const handleUpdatePatientStatus = async (patientId: string, status: PatientStatus) => {
    try {
      const updated = await patientService.updatePatient(patientId, { status });
      setPatients((prev) => prev.map((p) => (p.patient_id === patientId ? updated : p)));
      setSelectedPatient(updated);
      showToast(`Patient status updated to "${status}".`);
    } catch (err: any) {
      alert(`Error updating patient: ${err.message}`);
    }
  };

  const handleRerunPatientTriage = async (patientId: string) => {
    try {
      const updated = await patientService.rerunTriage(patientId);
      setPatients((prev) => prev.map((p) => (p.patient_id === patientId ? updated : p)));
      setSelectedPatient(updated);
      showToast(`AI Triage re-evaluated for ${updated.name}. Decision passport updated.`);
    } catch (err: any) {
      alert(`Error running triage: ${err.message}`);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await patientService.deletePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
      if (selectedPatient?.patient_id === patientId) setSelectedPatient(null);
      showToast(`Patient record removed.`);
    } catch (err: any) {
      alert(`Error deleting patient: ${err.message}`);
    }
  };

  // Handlers for Staff
  const handleCreateStaff = async (staffData: Partial<Staff>) => {
    try {
      const created = await staffService.createStaff(staffData);
      setStaffList((prev) => [...prev, created]);
      showToast(`Staff member ${created.name} added to roster.`);
    } catch (err: any) {
      alert(`Error registering staff: ${err.message}`);
    }
  };

  const handleToggleAttendance = async (staffId: string) => {
    try {
      const updated = await staffService.toggleAttendance(staffId);
      setStaffList((prev) => prev.map((s) => (s.staff_id === staffId ? updated : s)));
      showToast(`Attendance updated for ${updated.name}: ${updated.attendance}.`);
    } catch (err: any) {
      alert(`Error updating attendance: ${err.message}`);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await staffService.deleteStaff(staffId);
      setStaffList((prev) => prev.filter((s) => s.staff_id !== staffId));
      showToast(`Staff member removed.`);
    } catch (err: any) {
      alert(`Error removing staff: ${err.message}`);
    }
  };

  // Handlers for Resources
  const handleRestockResource = async (resourceId: string, units: number, notes?: string) => {
    try {
      const updated = await resourceService.restock(resourceId, units, notes);
      setResources((prev) => prev.map((r) => (r.resource_id === resourceId ? updated : r)));
      const newSummary = await resourceService.getSummary();
      setResourceSummary(newSummary);
      showToast(`Restocked ${units} ${updated.unit_measure} for ${updated.name}.`);
    } catch (err: any) {
      alert(`Error restocking resource: ${err.message}`);
    }
  };

  const handleUpdateThreshold = async (resourceId: string, minThreshold: number, notes?: string) => {
    try {
      const updated = await resourceService.updateThreshold(resourceId, minThreshold, notes);
      setResources((prev) => prev.map((r) => (r.resource_id === resourceId ? updated : r)));
      const newSummary = await resourceService.getSummary();
      setResourceSummary(newSummary);
      showToast(`Safety threshold updated to ${minThreshold} ${updated.unit_measure} for ${updated.name}. Predictions recalculated.`);
    } catch (err: any) {
      alert(`Error updating threshold: ${err.message}`);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[90vw]">
          <div className="px-4 py-3 rounded-2xl bg-teal-950/90 border border-teal-500/50 text-teal-200 text-xs font-semibold shadow-glow-teal flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Routes Matrix */}
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Page: Login & Register with transitions */}
        <Route path="/login" element={<AuthPage />} />

        {/* Protected Dashboard Shell Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <DashboardHome
                  patients={patients}
                  staffList={staffList}
                  summary={resourceSummary}
                  isLoading={isLoading}
                  onOpenIntake={() => setIsPatientModalOpen(true)}
                  onSelectPatient={setSelectedPatient}
                />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <PatientList
                  patients={patients}
                  isLoading={isLoading}
                  onSelectPatient={setSelectedPatient}
                  onOpenCreateModal={() => setIsPatientModalOpen(true)}
                  onDeletePatient={handleDeletePatient}
                  onRerunTriage={handleRerunPatientTriage}
                />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <StaffList
                  staffList={staffList}
                  isLoading={isLoading}
                  onOpenCreateModal={() => setIsStaffModalOpen(true)}
                  onToggleAttendance={handleToggleAttendance}
                  onDeleteStaff={handleDeleteStaff}
                  onUpdateStaffList={setStaffList}
                />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <ResourceDashboard
                  resources={resources}
                  summary={resourceSummary}
                  isLoading={isLoading}
                  onRefresh={loadAllData}
                  onRestock={handleRestockResource}
                  onUpdateThreshold={handleUpdateThreshold}
                />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/triage"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <TriageConsultationStudio />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <SearchAlgorithmVisualizer />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/digital-twin"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <HospitalDigitalTwin />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sdg"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <SdgImpactSection />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardShell
                criticalAlertCount={resourceSummary?.critical_alerts_count || 0}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
              >
                <SettingsPage />
              </DashboardShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Patient Intake Modal */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handleCreatePatient}
      />

      {/* Patient Detail Drawer */}
      <PatientDetailDrawer
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onUpdateStatus={handleUpdatePatientStatus}
        onRerunTriage={handleRerunPatientTriage}
      />

      {/* Staff Create Modal */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
