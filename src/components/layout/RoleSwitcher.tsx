import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import globalGennieLogoWhite from '../../assets/logo_white.png';
import {
  Shield,
  User,
  Ambulance,
  Building2,
  ChevronDown,
  LogIn,
  CheckCircle2,
  X,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface RoleSwitcherProps {
  onRoleSelect?: (role: UserRole) => void;
}

// Demo credentials for each protected role
const ROLE_CREDENTIALS: Record<string, { email: string; password: string }> = {
  authority: { email: 'admin@globalgennie.gov', password: 'authority2026' },
  responder: { email: 'responder@globalgennie.org', password: 'respond2026' },
  hotel_operator: { email: 'hotel@theparknavimumbai.com', password: 'hotel2026' },
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onRoleSelect }) => {
  const { role, switchUserRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Credential login flow state
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const roleDefinitions: {
    key: UserRole;
    title: string;
    badge: string;
    name: string;
    description: string;
    requiresLogin: boolean;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeColor: string;
    lockColor: string;
  }[] = [
    {
      key: 'tourist',
      title: 'Tourist',
      badge: 'Traveler Mode',
      name: 'Elena Rostova (Canada)',
      description: 'Access Safety Hub, Live Geofence Alerts, SOS Emergency Button, and Lost & Found.',
      requiresLogin: false,
      icon: User,
      accentColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      lockColor: '',
    },
    {
      key: 'authority',
      title: 'Authority / Operator',
      badge: 'Command Center',
      name: 'Inspector Rajiv Shinde (Navi Mumbai Police)',
      description: 'Real-time incident triage, automated responder dispatching, analytics, and zone configuration.',
      requiresLogin: true,
      icon: Shield,
      accentColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      lockColor: 'text-amber-300',
    },
    {
      key: 'responder',
      title: 'Emergency Responder',
      badge: 'Field Response',
      name: 'Officer Vikram Patil (Unit Alpha-1)',
      description: 'Accept dispatches, navigate to tourist GPS, update transit status, and file resolution reports.',
      requiresLogin: true,
      icon: Ambulance,
      accentColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      lockColor: 'text-rose-300',
    },
    {
      key: 'hotel_operator',
      title: 'Hotel / Tour Leader',
      badge: 'Concierge Portal',
      name: 'The Park Navi Mumbai (CBD Belapur)',
      description: 'Monitor guest safety check-ins, broadcast group advisories, and coordinate local assistance.',
      requiresLogin: true,
      icon: Building2,
      accentColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      lockColor: 'text-teal-300',
    },
  ];

  const activeRoleConfig = roleDefinitions.find((r) => r.key === role) || roleDefinitions[0];

  const handleRoleClick = (selectedRole: UserRole, requiresLogin: boolean) => {
    if (selectedRole === role) {
      // Already logged in, no-op
      return;
    }

    if (!requiresLogin) {
      // Tourist: free access
      switchUserRole(selectedRole);
      if (onRoleSelect) onRoleSelect(selectedRole);
      setIsModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Protected roles: show credential form
      const creds = ROLE_CREDENTIALS[selectedRole];
      setPendingRole(selectedRole);
      setEmailInput('');
      setPasswordInput('');
      setLoginError('');
      setShowPassword(false);
    }
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRole) return;

    setIsLoggingIn(true);
    setLoginError('');

    // Simulate brief async check
    setTimeout(() => {
      const expected = ROLE_CREDENTIALS[pendingRole];
      if (
        emailInput.trim().toLowerCase() === expected.email.toLowerCase() &&
        passwordInput === expected.password
      ) {
        switchUserRole(pendingRole);
        if (onRoleSelect) onRoleSelect(pendingRole);
        setPendingRole(null);
        setIsModalOpen(false);
        setIsLoggingIn(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setLoginError('Invalid email or password. Check the credentials shown below.');
        setIsLoggingIn(false);
      }
    }, 500);
  };

  const pendingRoleConfig = roleDefinitions.find((r) => r.key === pendingRole);
  const PendingIcon = pendingRoleConfig?.icon;

  return (
    <>
      {/* Top Demo Bar */}
      <div
        id="tour-role-switcher"
        className="bg-[#0b1120] border-b border-slate-800 text-slate-200 py-2 px-4 sm:px-6 lg:px-8 text-xs select-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Current Active Role Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-blue-500/30 tracking-wider">
              Role Login
            </span>
            <div className="flex items-center gap-2 min-w-0 truncate text-slate-300">
              <span className="font-semibold text-white truncate">{activeRoleConfig.title}:</span>
              <span className="text-slate-400 truncate hidden sm:inline">{activeRoleConfig.name}</span>
            </div>
          </div>

          {/* Right: Switch Role Login Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              setPendingRole(null);
              setLoginError('');
            }}
            className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch Role</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Role Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsModalOpen(false);
              setPendingRole(null);
              setLoginError('');
            }}
          />

          <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={globalGennieLogoWhite}
                    alt="Global Gennie"
                    className="h-6 w-auto max-w-[150px] object-contain"
                  />
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-500/30">
                    {pendingRole ? 'Secure Login' : 'Role Login System'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {pendingRole ? `Login as ${pendingRoleConfig?.title}` : 'Select Your Role'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingRole
                    ? 'Enter your authorized credentials to access this restricted dashboard.'
                    : 'Tourist access is open. Other roles require secure login credentials.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPendingRole(null);
                  setLoginError('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ──── CREDENTIAL LOGIN FORM (when a protected role is selected) ──── */}
            {pendingRole && pendingRoleConfig ? (
              <div className="p-5 sm:p-6">
                {/* Role Preview */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-5 ${pendingRoleConfig.accentColor}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square border ${pendingRoleConfig.accentColor}`}>
                    {PendingIcon && <PendingIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-bold text-sm text-white">{pendingRoleConfig.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pendingRoleConfig.badgeColor}`}>
                        {pendingRoleConfig.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{pendingRoleConfig.name}</p>
                  </div>
                </div>

                {/* Credential Form */}
                <form onSubmit={handleCredentialLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={ROLE_CREDENTIALS[pendingRole].email}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="Enter password..."
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-700/60 rounded-xl text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Demo credentials hint */}
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>Demo Credentials</span>
                    </div>
                    <p className="font-mono text-xs text-slate-300">
                      Email: <span className="text-blue-300">{ROLE_CREDENTIALS[pendingRole].email}</span>
                    </p>
                    <p className="font-mono text-xs text-slate-300">
                      Password: <span className="text-blue-300">{ROLE_CREDENTIALS[pendingRole].password}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingRole(null);
                        setLoginError('');
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                    >
                      {isLoggingIn ? (
                        <span>Verifying...</span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ──── ROLE SELECTION LIST ──── */
              <>
                <div className="p-5 sm:p-6 space-y-3 max-h-[65vh] overflow-y-auto">
                  {roleDefinitions.map((r) => {
                    const Icon = r.icon;
                    const isCurrent = role === r.key;

                    return (
                      <button
                        key={r.key}
                        onClick={() => handleRoleClick(r.key, r.requiresLogin)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 group ${
                          isCurrent
                            ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/30'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 aspect-square border ${r.accentColor}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-white">{r.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                                {r.badge}
                              </span>
                            </div>

                            {isCurrent ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            ) : r.requiresLogin ? (
                              <span className={`flex items-center gap-1 text-[11px] font-semibold shrink-0 ${r.lockColor}`}>
                                <Lock className="w-3 h-3" />
                                <span className="hidden sm:inline">Login Required</span>
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                                <span>Open Access</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-300 mb-0.5">{r.name}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Authority roles require secure login credentials</span>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
