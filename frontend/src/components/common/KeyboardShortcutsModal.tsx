import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', action: 'Switch to Patient Management' },
    { key: '2', action: 'Switch to Staff Management' },
    { key: '3', action: 'Switch to Resource Management' },
    { key: '4', action: 'Switch to AI Decision Engine' },
    { key: '5', action: 'Switch to Decision Graph Visualizer' },
    { key: '6', action: 'Switch to 3D Campus Digital Twin' },
    { key: '7', action: 'Switch to SDG 3 Impact & Course Mapping' },
    { key: 'Ctrl + K', action: 'Open Shortcuts Guide' },
    { key: 'Esc', action: 'Close Modal or Drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base">
              <Keyboard className="w-5 h-5 text-teal-600 dark:text-clinical-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/30 text-xs"
              >
                <span className="text-gray-700 dark:text-slate-300">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 font-mono text-[11px] text-teal-700 dark:text-clinical-300 font-bold shadow-xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/60 text-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

