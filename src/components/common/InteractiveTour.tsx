import React, { useState, useEffect, useRef } from 'react';
import globalGennieLogo from '../../assets/logo.png';
import {
  Shield,
  AlertOctagon,
  Map,
  FileText,
  Package,
  Users,
  User,
  Sparkles,
  Bell,
  LogIn,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  tab: string;
  targetId: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'safety-hub',
    title: 'Safety Hub & Active Monitoring',
    tab: 'home',
    targetId: 'tour-safety-hub',
    badge: 'Overview',
    description:
      'Your central dashboard displaying live GPS coordinates in Navi Mumbai, 24/7 emergency dispatch status, and quick safety navigation.',
    icon: Shield,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'emergency-sos',
    title: 'One-Tap Emergency SOS',
    tab: 'home',
    targetId: 'tour-sos-button',
    badge: 'Critical Safety',
    description:
      'Instantly trigger high-priority police and medical dispatch with your precise coordinates, blood group, allergies, and emergency contact auto-alerts.',
    icon: AlertOctagon,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    id: 'safety-map',
    title: 'Geofenced Safety Map',
    tab: 'map',
    targetId: 'tour-safety-map',
    badge: 'Live Geofences',
    description:
      'Interactive Navi Mumbai safety map featuring real-time geofence warnings (danger zones, safe havens), and 24/7 verified police, hospital, and pharmacy locations.',
    icon: Map,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'incident-reporting',
    title: 'Incident Reporting & Triage',
    tab: 'incidents',
    targetId: 'tour-incidents',
    badge: 'Incident Log',
    description:
      'Report issues like medical distress, theft, harassment, or road hazards in under 30 seconds. Track live responder assignments and resolution status.',
    icon: FileText,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: 'lost-found',
    title: 'Lost & Found Central Registry',
    tab: 'lostfound',
    targetId: 'tour-lostfound',
    badge: 'Property Recovery',
    description:
      'Official tourist property registry directly synced with transit police desks, airport terminals, and partner hotels to recover lost items quickly.',
    icon: Package,
    iconBg: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  {
    id: 'travel-groups',
    title: 'Travel Groups & Companion Safety',
    tab: 'groups',
    targetId: 'tour-groups',
    badge: 'Companion Tracking',
    description:
      'Stay connected with your travel companions, check in at designated landmarks, share safety statuses, and alert your certified tour guide.',
    icon: Users,
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 'profile-passport',
    title: 'Digital Tourist Profile & Medical ID',
    tab: 'profile',
    targetId: 'tour-profile',
    badge: 'Medical Passport',
    description:
      'Store your emergency contacts, blood group, medical conditions, and hotel details to ensure first responders have instant context during emergencies.',
    icon: User,
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  },
  {
    id: 'ai-guide',
    title: '24/7 AI Safety Companion',
    tab: 'home',
    targetId: 'tour-ai-button',
    badge: 'Multilingual AI',
    description:
      'Ask the AI for emergency translations into 10 languages, rapid incident classification, local Navi Mumbai safety advisories, or 1-tap SOS assistance.',
    icon: Sparkles,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    id: 'live-notifications',
    title: 'Broadcast Safety Alerts',
    tab: 'home',
    targetId: 'tour-notifications',
    badge: 'Alerts',
    description:
      'Receive instant notifications for geofence breaches, responder dispatches, emergency updates, and official safety broadcasts.',
    icon: Bell,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    id: 'role-switcher',
    title: 'Multi-Role Authority Perspectives',
    tab: 'home',
    targetId: 'tour-role-switcher',
    badge: 'Prototype Access',
    description:
      'Switch between Traveler mode, Police Authority Command Center, Field Responder console, and Hotel Portals with role-based credential logins.',
    icon: LogIn,
    iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];

interface InteractiveTourProps {
  isActive: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isActive,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Navigate to tab & highlight target when step changes
  useEffect(() => {
    if (!isActive || !step) return;

    // Navigate to step tab
    onNavigateTab(step.tab);

    const updateTargetPosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        // Scroll target smoothly into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updateTargetPosition, 200);
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [currentStepIndex, isActive, step, onNavigateTab]);

  if (!isActive || !step) return null;

  const Icon = step.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('globalgennie_tour_completed', 'true');
    setCurrentStepIndex(0);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('globalgennie_tour_completed', 'true');
    setCurrentStepIndex(0);
    onClose();
  };

  // Calculate viewport-safe spotlight cutout dimensions
  const pad = 10;
  const spotlightX = targetRect ? Math.max(6, Math.min(window.innerWidth - 40, targetRect.left - pad)) : 0;
  const spotlightY = targetRect ? Math.max(6, Math.min(window.innerHeight - 40, targetRect.top - pad)) : 0;
  const spotlightW = targetRect ? Math.min(window.innerWidth - spotlightX - 6, targetRect.width + pad * 2) : 0;
  const spotlightH = targetRect ? Math.min(window.innerHeight - spotlightY - 6, targetRect.height + pad * 2) : 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden">
      {/* 
        SVG CUTOUT OVERLAY:
        The target element is 100% SHARP AND UNBLURRED (cutout with black in mask),
        while the entire rest of the viewport is darkened smoothly with dark scrim.
      */}
      <svg className="fixed inset-0 w-full h-full z-[52] pointer-events-auto">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White = opaque scrim overlay covering everything */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = 100% transparent window revealing the sharp target */}
            {targetRect && (
              <rect
                x={spotlightX}
                y={spotlightY}
                width={spotlightW}
                height={spotlightH}
                rx="20"
                ry="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Darkened overlay rectangle with mask cutout applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#tour-spotlight-mask)"
          onClick={handleSkip}
          className="cursor-pointer"
        />
      </svg>

      {/* Glowing animated blue spotlight border around the cutout */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[54] rounded-3xl border-2 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.6)] animate-pulse transition-all duration-300 ease-out"
          style={{
            top: spotlightY,
            left: spotlightX,
            width: spotlightW,
            height: spotlightH,
          }}
        />
      )}

      {/* Clean White Rounded Information Box */}
      <div className="fixed inset-x-3 bottom-3 sm:bottom-8 sm:inset-x-auto sm:right-8 sm:max-w-md z-[60] animate-fade-in-up">
        <div
          ref={cardRef}
          className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 overflow-hidden relative"
        >
          {/* Top Brand & Progress Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2">
              <img
                src={globalGennieLogo}
                alt="Global Gennie"
                className="h-5 sm:h-6 w-auto object-contain"
              />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Product Tour
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentStepIndex + 1} / {TOUR_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Skip Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Progress Line */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Feature Header */}
          <div className="flex items-start gap-3.5 mb-2.5">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 aspect-square border shadow-xs ${step.iconBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {step.badge}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Feature Explanation */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
              >
                <span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
