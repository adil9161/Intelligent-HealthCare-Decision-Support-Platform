import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Sliders,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
  Cpu,
  Bed,
  Wind,
} from 'lucide-react';

interface NotificationSettings {
  enableInAppToasts: boolean;
  enableAudioChime: boolean;
  audioVolume: number;
  enableSmsPager: boolean;
  pagerPhoneNumber: string;
  bedShortageThresholdPct: number;
  oxygenWarningHorizonHours: number;
  autoEscalateRedFlags: boolean;
  showCertaintyCalculations: boolean;
  defaultSearchAlgorithm: string;
}

const defaultSettings: NotificationSettings = {
  enableInAppToasts: true,
  enableAudioChime: true,
  audioVolume: 80,
  enableSmsPager: false,
  pagerPhoneNumber: '+91 98765 43210',
  bedShortageThresholdPct: 10,
  oxygenWarningHorizonHours: 48,
  autoEscalateRedFlags: true,
  showCertaintyCalculations: true,
  defaultSearchAlgorithm: 'ASTAR',
};

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const { user } = useAuth();

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const cached = localStorage.getItem('aegis_settings');
    if (cached) {
      try {
        return { ...defaultSettings, ...JSON.parse(cached) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testAlertTriggered, setTestAlertTriggered] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('aegis_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem('aegis_settings', JSON.stringify(defaultSettings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const triggerTestAlert = () => {
    setTestAlertTriggered(true);
    if (settings.enableAudioChime) {
      try {
        // Web Audio API synthesized soft chime
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime((settings.audioVolume / 100) * 0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        // Audio API not supported or user has not interacted yet
      }
    }
    setTimeout(() => setTestAlertTriggered(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Clinical System & Notification Preferences</span>
            <Badge variant="info">Configuration</Badge>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Customize real-time shortage alert thresholds, audio chimes, AI triage parameters, and display themes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => handleSave()}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Settings Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Your notification and system settings have been saved and applied across this session.</span>
        </div>
      )}

      {testAlertTriggered && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-coral-500/20 dark:border-coral-500/40 dark:text-coral-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-coral-400 animate-pulse" />
            <span><strong>[TEST ALERT]</strong> ICU Bed Reserve under 10% safety margin. Chime delivered at {settings.audioVolume}% volume.</span>
          </div>
          <span className="text-[10px] bg-rose-100 dark:bg-coral-500/30 px-2 py-0.5 rounded font-mono font-semibold">Simulated</span>
        </div>
      )}

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Clinical Notification Channels */}
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 dark:bg-clinical-500/20 dark:text-clinical-400 dark:border-clinical-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alert Dispatch Channels</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Controls how critical hospital shortage events are delivered</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* In-app Toast Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Non-Blocking Toast Stack</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Floating cards sorted by severity without obstructing workspace</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableInAppToasts}
                  onChange={(e) => setSettings({ ...settings, enableInAppToasts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Audio Chime Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Audio Chime for Critical Alerts</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Harmonic synthesizer tone for Code Red and &lt;10% bed drops</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAudioChime}
                  onChange={(e) => setSettings({ ...settings, enableAudioChime: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Volume Slider */}
            {settings.enableAudioChime && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    {settings.audioVolume > 0 ? <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>Chime Volume</span>
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white font-bold">{settings.audioVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audioVolume}
                  onChange={(e) => setSettings({ ...settings, audioVolume: Number(e.target.value) })}
                  className="w-full accent-teal-600 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* SMS / Pager Gateway */}
            <div className="pt-2 border-t border-gray-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Attending Physician Pager Gateway</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Direct SMS notification for emergency triage triggers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableSmsPager}
                    onChange={(e) => setSettings({ ...settings, enableSmsPager: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {settings.enableSmsPager && (
                <div className="mt-2">
                  <input
                    type="tel"
                    value={settings.pagerPhoneNumber}
                    onChange={(e) => setSettings({ ...settings, pagerPhoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              )}
            </div>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={triggerTestAlert}
              className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-teal-700 font-bold text-xs border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-clinical-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Alert Delivery & Chime</span>
            </button>
          </div>
        </GlassCard>

        {/* Section 2: Predictive Shortage Thresholds */}
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rule Engine Thresholds</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Mathematical cutoffs triggering predictive shortage warnings</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bed Reserve Safety Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300 font-semibold">
                  <Bed className="w-4 h-4 text-teal-600 dark:text-clinical-400" /> Bed Critical Reserve Trigger
                </span>
                <span className="font-mono text-rose-600 dark:text-coral-400 font-black text-sm">
                  &lt; {settings.bedShortageThresholdPct}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={settings.bedShortageThresholdPct}
                onChange={(e) => setSettings({ ...settings, bedShortageThresholdPct: Number(e.target.value) })}
                className="w-full accent-rose-500 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">
                SDG 3 Target 3.d standard flags Critical Alert when available beds drop below this capacity percentage.
              </p>
            </div>

            {/* Oxygen Horizon */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Wind className="w-4 h-4 text-sky-500" /> Oxygen Runout Horizon
              </label>
              <select
                value={settings.oxygenWarningHorizonHours}
                onChange={(e) => setSettings({ ...settings, oxygenWarningHorizonHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value={24}>24 Hours (Immediate Crisis Reserve)</option>
                <option value={48}>48 Hours (Standard Logistics Buffer)</option>
                <option value={72}>72 Hours (Long-Lead Cryogenic Tanker)</option>
              </select>
              <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">
                Fires warning when current burn rate would deplete reserves within this window.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: AI Inference & Search Configuration */}
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Decision Engine Settings</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Certainty factor weighting and search graph defaults</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Auto-escalate Red Flags */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Auto-Escalate Red-Flag Triages</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Escalate acute presentations to Emergency stream automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoEscalateRedFlags}
                  onChange={(e) => setSettings({ ...settings, autoEscalateRedFlags: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Display CF Formulas */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Display Certainty Factor Trace</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Render Buchanan & Shortliffe formulas for students and researchers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCertaintyCalculations}
                  onChange={(e) => setSettings({ ...settings, showCertaintyCalculations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Default Search Algorithm */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Default Graph Navigation Algorithm
              </label>
              <select
                value={settings.defaultSearchAlgorithm}
                onChange={(e) => setSettings({ ...settings, defaultSearchAlgorithm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ASTAR">A* Search (Optimal f(n) = g(n) + h(n))</option>
                <option value="GREEDY">Greedy Best-First Search (Heuristic h(n) only)</option>
                <option value="BFS">Breadth-First Search (Shortest Edge Hops)</option>
                <option value="DFS">Depth-First Search (Deep Branch Exploration)</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Global Theme & Display Mode */}
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Visual Appearance & Themes</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Smooth CSS theme transitions across high-contrast modes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-2">
                Active Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    theme === 'light'
                      ? 'bg-teal-50/70 border-teal-600 text-teal-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Clinical Light</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Calm daylight high-contrast</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-teal-500 text-white shadow-glow-cyan'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4 text-teal-500" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Clinical Dark</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Midnight slate & teal</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-[11px] text-gray-600 dark:text-slate-400">
              <p className="font-semibold text-gray-800 dark:text-slate-300 mb-1">Smooth Transition Active</p>
              Transitions interpolate smoothly between dark and light modes with zero layout shift (CLS &lt; 0.1).
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
