import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { globalTheme } from '../routes/AuthPage';
import Background from './Background';
import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// WORKING ICON IMPORTS - Mixed approach
import { 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';

import { 
  InformationCircleIcon,
  ShieldCheckIcon,
  ScaleIcon,
  DocumentTextIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session, signOut, profile } = useAuth();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(globalTheme.isDarkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const isAdmin = session && (
  session.user?.email === 'tvradar567@gmail.com' || 
  (profile as any)?.is_admin === true
);

  // Check if we should show user icons
  const shouldShowUserIcons = session && (
    location.pathname === '/dashboard' || 
    location.pathname === '/admin' ||
    location.pathname === '/profile'
  );

  // --- Global Theme Handling ---
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    globalTheme.setIsDarkMode(newTheme);
  }, [isDarkMode]);

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  // --- Mobile Menu Management ---
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // --- Mobile-First Theme Styles ---
  const themeClasses = isDarkMode
    ? {
        bg: 'bg-slate-900',
        headerBg: 'rgba(15, 23, 42, 0.75)',
        headerBorder: 'border-purple-500/20',
        headerScrolled: 'scrolled-dark',
        text: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        accent: 'text-purple-400',
        button: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
        navHover: 'hover:bg-purple-500/20 text-slate-200',
        logoGradient: 'from-purple-400 to-blue-400',
        mobileMenuBg: 'bg-slate-900/95',
        logoutBtn: 'hover:bg-red-500/20 text-red-400',
        profileBtn: 'hover:bg-blue-500/20 text-blue-400',
        adminBtn: 'hover:bg-green-500/20 text-green-400',
        badge: 'bg-blue-600/90 hover:bg-blue-700/90 text-white border-blue-400/20',
        modalBg: 'bg-slate-800/95 border-slate-700/50',
        cardBg: 'bg-slate-800/60 border-slate-700/50 backdrop-blur-sm',
      }
    : {
        bg: 'bg-slate-50',
        headerBg: 'rgba(255, 255, 255, 0.75)',
        headerBorder: 'border-indigo-200/50',
        headerScrolled: 'scrolled-light',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-500',
        accent: 'text-indigo-600',
        button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
        navHover: 'hover:bg-indigo-500/20 text-slate-700',
        logoGradient: 'from-indigo-600 to-purple-600',
        mobileMenuBg: 'bg-white/95',
        logoutBtn: 'hover:bg-red-500/20 text-red-600',
        profileBtn: 'hover:bg-blue-500/20 text-blue-600',
        adminBtn: 'hover:bg-green-500/20 text-green-600',
        badge: 'bg-indigo-600/90 hover:bg-indigo-700/90 text-white border-indigo-400/20',
        modalBg: 'bg-white/95 border-slate-200/60',
        cardBg: 'bg-white/80 border-slate-200/60 backdrop-blur-sm',
      };

  // --- Enhanced Header Loading Animations ---
  useGSAP(() => {
    if (!headerRef.current) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    ScrollTrigger.create({
      trigger: document.body,
      start: '10px top',
      end: 'bottom top',
      toggleClass: {
        targets: headerRef.current,
        className: themeClasses.headerScrolled,
      },
      scrub: false,
      onEnter: () => {
        if (headerRef.current) {
          gsap.to(headerRef.current, {
            backdropFilter: 'blur(20px)',
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      },
      onLeave: () => {
        if (headerRef.current) {
          gsap.to(headerRef.current, {
            backdropFilter: 'blur(12px)',
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    });

    const mm = gsap.matchMedia();
    
    mm.add('(min-width: 768px)', () => {
      if (!headerRef.current) return;
      
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      tl.fromTo(headerRef.current, 
        { y: -100, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.2 }
      )
      .fromTo('.logo-anim', 
        { scale: 0.3, autoAlpha: 0, rotationY: 180 },
        { scale: 1, autoAlpha: 1, rotationY: 0, duration: 1, ease: 'back.out(1.7)' }, 
        0.2
      )
      .fromTo('.logo-anim .w-10', 
        { rotationZ: -90 },
        { rotationZ: 0, duration: 0.8, ease: 'power3.out' }, 
        0.4
      )
      .fromTo('.header-controls', 
        { x: 50, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8 }, 
        0.5
      );
    });

    mm.add('(max-width: 767px)', () => {
      if (!headerRef.current) return;
      
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.fromTo(headerRef.current, 
        { y: -80, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1 }
      )
      .fromTo('.logo-anim', 
        { scale: 0.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.4)' }, 
        0.2
      )
      .fromTo('.mobile-controls', 
        { x: 30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.6 }, 
        0.4
      );
    });

    return () => mm.revert();
  }, { scope: headerRef, dependencies: [themeClasses.headerScrolled] });

  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    
    gsap.to(mobileMenuRef.current, {
      x: isMenuOpen ? '0%' : '100%',
      duration: 0.4,
      ease: 'power3.inOut',
    });
    if (isMenuOpen) {
      gsap.fromTo(
        '.mobile-nav-item',
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, stagger: 0.05, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, { dependencies: [isMenuOpen], scope: mobileMenuRef });

  const handleSignOut = useCallback(() => {
    if (confirm('Are you sure you want to logout?')) {
      signOut();
    }
  }, [signOut]);

  const WIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h3l1.5 12L9 3h6l1.5 12L18 3h3l-2.5 18h-3L14 9l-1.5 12h-3L7 9l-1.5 12h-3L3 3z" />
    </svg>
  );

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-500 ${themeClasses.bg}`}>
      <Background />

      {/* 🛡️ PRIVACY POLICY MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999999 }}>
          <div className={`${themeClasses.modalBg} ${themeClasses.cardBg} border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-opacity-20">
              <h2 className={`text-xl font-bold ${themeClasses.text} flex items-center gap-3`}>
                <div className="w-6 h-6">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                </div>
                Privacy & Legal Terms
              </h2>
              <button
                onClick={() => setShowPolicyModal(false)}
                className={`${themeClasses.textMuted} hover:text-red-500 p-2 rounded-lg transition-all duration-200 hover:scale-110`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Privacy Statement */}
              <div className="space-y-3">
                <h3 className={`${themeClasses.textSecondary} font-semibold text-lg flex items-center gap-2`}>
                  <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  Your Privacy Matters
                </h3>
                <p className={`${themeClasses.textMuted} leading-relaxed`}>
                  We <strong className={themeClasses.textSecondary}>never breach, sell, or misuse your data</strong>. Your information is only used to improve your WatchWithRadar.Live experience. We follow industry-standard encryption and security practices to protect your personal information.
                </p>
              </div>

              {/* Data Protection Guarantee */}
              <div className="space-y-3">
                <h3 className={`${themeClasses.textSecondary} font-semibold text-lg flex items-center gap-2`}>
                  <ScaleIcon className="h-5 w-5 text-blue-500" />
                  Data Protection Guarantee
                </h3>
                <p className={`${themeClasses.textMuted} leading-relaxed`}>
                  If you find us misusing your data, email us at{' '}
                  <a 
                    href="mailto:tvradar567@gmail.com" 
                    className={`${themeClasses.accent} hover:underline font-semibold`}
                  >
                    tvradar567@gmail.com
                  </a>
                  {' '}– we'll provide fair compensation and immediate service closure if our practices don't meet our promises.
                </p>
              </div>

              {/* Copyright Notice */}
              <div className="space-y-3">
                <h3 className={`${themeClasses.textSecondary} font-semibold text-lg flex items-center gap-2`}>
                  <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                  Copyright & Content Policy
                </h3>
                <p className={`${themeClasses.textMuted} leading-relaxed`}>
                  Content owners can request removal by emailing{' '}
                  <a 
                    href="mailto:tvradar567@gmail.com" 
                    className={`${themeClasses.accent} hover:underline font-semibold`}
                  >
                    tvradar567@gmail.com
                  </a>
                  {' '}– we'll remove copyrighted content within 48 hours. We respect intellectual property rights and work quickly to resolve any concerns.
                </p>
              </div>

              {/* Contact & Support */}
              <div className="space-y-3">
                <h3 className={`${themeClasses.textSecondary} font-semibold text-lg flex items-center gap-2`}>
                  <HeartIcon className="h-5 w-5 text-red-500" />
                  Contact & Support
                </h3>
                <p className={`${themeClasses.textMuted} leading-relaxed`}>
                  Have questions or concerns? We're here to help! Reach out to us at{' '}
                  <a 
                    href="mailto:tvradar567@gmail.com" 
                    className={`${themeClasses.accent} hover:underline font-semibold`}
                  >
                    tvradar567@gmail.com
                  </a>
                  {' '}and we'll respond within 24 hours.
                </p>
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-600/30' : 'border-slate-300/30'}`}>
                <p className={`${themeClasses.textMuted} text-sm text-center`}>
                  By using WatchWithRadar, you agree to our data practices and policies outlined above. 
                  <br />
                  <span className="font-semibold">Last updated: September 2025</span>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-opacity-20 text-center">
              <button
                onClick={() => setShowPolicyModal(false)}
                className={`${themeClasses.button} px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 mx-auto`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header with Privacy Icon */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all duration-500 ${themeClasses.headerBorder}`}
        style={{ background: themeClasses.headerBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
          <Link
            to="/dashboard"
            className={`logo-anim font-bold text-xl sm:text-2xl flex items-center gap-3 group ${themeClasses.text}`}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeClasses.logoGradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
            >
              <WIcon />
            </div>
            <span className={`inline bg-gradient-to-r ${themeClasses.logoGradient} bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105`}>
              WatchWithRadar
            </span>
          </Link>
          
          {/* Desktop Controls with Privacy Icon */}
          <div className="hidden md:flex items-center gap-2 header-controls">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Toggle theme"
              title="Toggle theme"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-400 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <MoonIcon className="h-6 w-6 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* PRIVACY POLICY ICON IN HEADER */}
            <button
              onClick={() => setShowPolicyModal(true)}
              className={`p-3 rounded-lg ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Privacy & Terms"
              title="Privacy & Terms"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <InformationCircleIcon className="h-6 w-6 text-blue-500 transition-transform duration-300 hover:rotate-12" />
            </button>

            {shouldShowUserIcons && (
              <>
                <Link
                  to="/profile"
                  className={`p-3 rounded-lg ${themeClasses.profileBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Profile"
                  title="Profile"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <UserCircleIcon className="h-6 w-6" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`p-3 rounded-lg ${themeClasses.adminBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                    aria-label="Admin Panel"
                    title="Admin Panel"
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <Cog6ToothIcon className="h-6 w-6" />
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className={`p-3 rounded-lg ${themeClasses.logoutBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Logout"
                  title="Logout"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Header Controls with Privacy Icon */}
          <div className="md:hidden flex items-center gap-2 mobile-controls">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-md ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Toggle theme"
              title="Toggle theme"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-400 transition-transform duration-300" />
              ) : (
                <MoonIcon className="h-6 w-6 text-slate-600 transition-transform duration-300" />
              )}
            </button>

            {/* PRIVACY POLICY ICON IN MOBILE HEADER */}
            <button
              onClick={() => setShowPolicyModal(true)}
              className={`p-3 rounded-md ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Privacy & Terms"
              title="Privacy & Terms"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <InformationCircleIcon className="h-5 w-5 text-blue-500 transition-transform duration-300" />
            </button>

            {shouldShowUserIcons && (
              <>
                <Link
                  to="/profile"
                  className={`p-3 rounded-md ${themeClasses.profileBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Profile"
                  title="Profile"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <UserCircleIcon className="h-5 w-5" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`p-3 rounded-md ${themeClasses.adminBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                    aria-label="Admin Panel"
                    title="Admin Panel"
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className={`p-3 rounded-md ${themeClasses.logoutBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Logout"
                  title="Logout"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
