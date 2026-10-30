import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Shield,
  Stethoscope,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, sessionExpired, clearSessionExpiredToast, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('dr.nazim@niet.ac.in');
  const [password, setPassword] = useState('Doctor@123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [department, setDepartment] = useState('Cardiology');

  // Validation states (validated on blur)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Failed login error & shake trigger
  const [loginError, setLoginError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState<number>(0);

  // Field validation logic on blur
  const validateField = (field: string, val: string) => {
    let err = '';
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val.trim()) {
        err = 'Email address is required.';
      } else if (!emailRegex.test(val)) {
        err = 'Please enter a valid clinical email address.';
      }
    } else if (field === 'password') {
      if (!val) {
        err = 'Password is required.';
      } else if (val.length < 6) {
        err = 'Password must be at least 6 characters.';
      }
    } else if (field === 'fullName') {
      if (!val.trim()) {
        err = 'Full name is required for medical accountability.';
      } else if (val.trim().length < 3) {
        err = 'Name must be at least 3 characters.';
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') validateField('email', email);
    if (field === 'password') validateField('password', password);
    if (field === 'fullName') validateField('fullName', fullName);
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setLoginError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Validate all
    const eErr = validateField('email', email);
    const pErr = validateField('password', password);
    let fErr = '';
    if (mode === 'register') {
      fErr = validateField('fullName', fullName);
    }

    if (eErr || pErr || fErr) {
      setShakeKey((prev) => prev + 1);
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName, role, department);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please verify your clinical login.');
      setShakeKey((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-500/30 dark:selection:text-teal-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-radial from-teal-500/10 via-coral-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Session Expired Toast Banner */}
      {sessionExpired && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-md w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-500/50 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Your session has expired. Please sign in again to continue clinical operations.</span>
          </div>
          <button
            onClick={clearSessionExpiredToast}
            className="text-amber-700 dark:text-amber-400 font-bold hover:text-amber-900 dark:hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Auth Container */}
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-glow-teal mb-3">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            AegisHealth AI Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Intelligent Healthcare Decision Support Platform • NIET Greater Noida
          </p>
        </div>

        {/* Shake container for failed submission */}
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-6 sm:p-8 border-gray-200 dark:border-teal-800/60 shadow-sm dark:shadow-glass">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-slate-900/90 p-1 border border-gray-200 dark:border-teal-900/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none ${
                  mode === 'login'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none ${
                  mode === 'register'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Register Practitioner
              </button>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/70 dark:border-red-500/50 dark:text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                        Full Name & Credentials *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Dr. Rajesh Verma, MD"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (touched.fullName) validateField('fullName', e.target.value);
                          }}
                          onBlur={() => handleBlur('fullName')}
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                            touched.fullName && errors.fullName
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-slate-700 focus:border-teal-500'
                          }`}
                        />
                      </div>
                      {touched.fullName && errors.fullName && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Role & Department */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                          Role
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="Doctor">Doctor</option>
                          <option value="Nurse">Staff / Nurse</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Pulmonology">Pulmonology</option>
                          <option value="General Medicine">General Medicine</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="doctor@niet.ac.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField('email', e.target.value);
                    }}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                      touched.email && errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-slate-700 focus:border-teal-500'
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateField('password', e.target.value);
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                      touched.password && errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-slate-700 focus:border-teal-500'
                    }`}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-400 hover:to-coral-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-coral-400 focus-visible:outline-none"
              >
                <span>{isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-2.5 text-center">
                1-Click Academic Demo Credentials
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('dr.nazim@niet.ac.in', 'Doctor@123')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-400 dark:bg-slate-900 dark:hover:bg-teal-950/60 dark:border-slate-700/60 dark:hover:border-teal-500 text-left transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
                  title="Sign in as Attending Physician"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mb-1" />
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">Doctor</p>
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 truncate">Dr. Nazim</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('nurse.priya@niet.ac.in', 'Staff@123')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-400 dark:bg-slate-900 dark:hover:bg-teal-950/60 dark:border-slate-700/60 dark:hover:border-teal-500 text-left transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
                  title="Sign in as Triage Staff"
                >
                  <UserCheck className="w-3.5 h-3.5 text-coral-500 dark:text-coral-400 mb-1" />
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">Staff</p>
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 truncate">Priya, RN</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@niet.ac.in', 'Admin@123')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-400 dark:bg-slate-900 dark:hover:bg-teal-950/60 dark:border-slate-700/60 dark:hover:border-teal-500 text-left transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
                  title="Sign in as System Admin"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mb-1" />
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">Admin</p>
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 truncate">NIET Lab</p>
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

