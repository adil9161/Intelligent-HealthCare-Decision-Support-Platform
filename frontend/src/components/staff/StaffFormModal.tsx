import React, { useState } from 'react';
import { Staff, StaffRole, AttendanceStatus, AvailabilityStatus } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { X, UserPlus } from 'lucide-react';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Partial<Staff>) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [role, setRole] = useState<StaffRole>('Doctor');
  const [salary, setSalary] = useState<number>(120000);
  const [attendance, setAttendance] = useState<AttendanceStatus>('Present');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [qualification, setQualification] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        department,
        role,
        salary: Number(salary),
        attendance,
        attendance_percentage: 95.0,
        availability,
        shift,
        qualification: qualification || `${role} Specialist`,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@niet.ac.in`,
        phone: phone || '+91 98XXX XXXXX',
        current_patient_load: 0,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 dark:bg-clinical-500/20 dark:text-clinical-400 dark:border-clinical-500/40 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Register Clinical Staff</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Add medical practitioner or healthcare professional</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Staff Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sunita Kulkarni"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Clinical Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Emergency">Emergency Trauma</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Professional Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Surgeon">Surgeon</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Radiologist">Radiologist</option>
                  <option value="Technician">Technician</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Salary (Monthly ₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Assigned Shift</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Morning">Morning (08:00 - 16:00)</option>
                  <option value="Evening">Evening (16:00 - 00:00)</option>
                  <option value="Night">Night (00:00 - 08:00)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Attendance Status</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as AttendanceStatus)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Present">Present</option>
                  <option value="On Leave">On Leave</option>
                  <option value="In Surgery">In Surgery</option>
                  <option value="On Call">On Call</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Break">On Break</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Qualifications & Credentials</label>
              <input
                type="text"
                placeholder="e.g. MBBS, MD (Cardiology), FACC"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {isSubmitting ? 'Registering...' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

