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
  Cog6ToothIcon,
  Bars3Icon
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
    session.user?.email === 'methodsomp@gmail.com' ||
    (profile as any)?.is_admin === true
  );

  // **UPDATED: Check if we should show user icons - ADDED /stream route**
  const shouldShowUserIcons = session && (
    location.pathname === '/dashboard' || 
    location.pathname === '/admin' ||
    location.pathname === '/profile' ||
    location.pathname === '/stream'  // ✅ ADDED STREAM ROUTE
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
        headerBg: 'rgba(15, 23, 42, 0.9)',
        headerBorder: 'border-purple-500/20',
        headerScrolled: 'scrolled-dark',
        text: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        accent: 'text-purple-400',
        button: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
        navHover: 'hover:bg-purple-500/20 text-slate-200',
        logoGradient: 'from-purple-400 to-blue-400',
        mobileMenuBg: 'bg-slate-900/98 backdrop-blur-xl',
        logoutBtn: 'hover:bg-red-500/20 text-red-400',
        profileBtn: 'hover:bg-blue-500/20 text-blue-400',
        adminBtn: 'hover:bg-green-500/20 text-green-400',
        badge: 'bg-blue-600/90 hover:bg-blue-700/90 text-white border-blue-400/20',
        modalBg: 'bg-slate-800/95 border-slate-700/50',
        cardBg: 'bg-slate-800/60 border-slate-700/50 backdrop-blur-sm',
        hamburger: 'hover:bg-purple-500/20 text-purple-400',
      }
    : {
        bg: 'bg-slate-50',
        headerBg: 'rgba(255, 255, 255, 0.9)',
        headerBorder: 'border-indigo-200/50',
        headerScrolled: 'scrolled-light',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-500',
        accent: 'text-indigo-600',
        button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
        navHover: 'hover:bg-indigo-500/20 text-slate-700',
        logoGradient: 'from-indigo-600 to-purple-600',
        mobileMenuBg: 'bg-white/98 backdrop-blur-xl',
        logoutBtn: 'hover:bg-red-500/20 text-red-600',
        profileBtn: 'hover:bg-blue-500/20 text-blue-600',
        adminBtn: 'hover:bg-green-500/20 text-green-600',
        badge: 'bg-indigo-600/90 hover:bg-indigo-700/90 text-white border-indigo-400/20',
        modalBg: 'bg-white/95 border-slate-200/60',
        cardBg: 'bg-white/80 border-slate-200/60 backdrop-blur-sm',
        hamburger: 'hover:bg-indigo-500/20 text-indigo-600',
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
        { y: -60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8 }
      )
      .fromTo('.logo-anim', 
        { scale: 0.7, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)' }, 
        0.2
      )
      .fromTo('.mobile-controls', 
        { x: 20, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.4 }, 
        0.3
      );
    });

    return () => mm.revert();
  }, { scope: headerRef, dependencies: [themeClasses.headerScrolled] });

  // Mobile menu slide animation
  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    
    if (isMenuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { x: '100%', autoAlpha: 0 },
        { x: '0%', autoAlpha: 1, duration: 0.3, ease: 'power3.out' }
      );
      gsap.fromTo('.mobile-nav-item',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, stagger: 0.05, delay: 0.1, ease: 'power2.out' }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        x: '100%',
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power3.inOut',
      });
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

      {/* 📱 ULTRA MOBILE-FRIENDLY HEADER */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${themeClasses.headerBorder}`}
        style={{ background: themeClasses.headerBg }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* RESPONSIVE LOGO */}
          <Link
            to="/dashboard"
            className={`logo-anim font-bold text-lg sm:text-xl lg:text-2xl flex items-center gap-2 sm:gap-3 group ${themeClasses.text}`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br ${themeClasses.logoGradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
            >
              <WIcon />
            </div>
            <span className={`inline bg-gradient-to-r ${themeClasses.logoGradient} bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 hidden xs:inline`}>
              WatchWithRadar
            </span>
          </Link>
          
          {/* DESKTOP CONTROLS */}
          <div className="hidden lg:flex items-center gap-1 header-controls">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            <button
              onClick={() => setShowPolicyModal(true)}
              className={`p-2.5 rounded-lg ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Privacy & Terms"
              title="Privacy & Terms"
            >
              <InformationCircleIcon className="h-5 w-5 text-blue-500 transition-transform duration-300 hover:rotate-12" />
            </button>

            {shouldShowUserIcons && (
              <>
                <Link
                  to="/profile"
                  className={`p-2.5 rounded-lg ${themeClasses.profileBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Profile"
                  title="Profile"
                >
                  <UserCircleIcon className="h-5 w-5" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`p-2.5 rounded-lg ${themeClasses.adminBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                    aria-label="Admin Panel"
                    title="Admin Panel"
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className={`p-2.5 rounded-lg ${themeClasses.logoutBtn} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  aria-label="Logout"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* MOBILE HAMBURGER MENU BUTTON */}
          <div className="lg:hidden flex items-center gap-1 mobile-controls">
            {/* Quick Theme Toggle on Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${themeClasses.navHover} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 text-yellow-400" />
              ) : (
                <MoonIcon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${themeClasses.hamburger} flex items-center justify-center transition-all duration-300 hover:scale-110`}
              aria-label="Toggle menu"
              title="Menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 📱 ENHANCED MOBILE SLIDE-OUT MENU */}
      {isMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Menu Panel */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-full w-80 ${themeClasses.mobileMenuBg} border-l ${themeClasses.headerBorder} z-50 lg:hidden transform translate-x-full shadow-2xl`}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Menu Header */}
            <div className={`flex items-center justify-between p-6 border-b ${themeClasses.headerBorder}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${themeClasses.logoGradient} flex items-center justify-center text-white shadow-lg`}>
                  <WIcon />
                </div>
                <h3 className={`${themeClasses.text} font-bold text-lg`}>Menu</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 rounded-lg ${themeClasses.navHover} transition-all duration-300 hover:scale-110`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col h-full pt-6 pb-6 px-6 space-y-3">
              
              {/* User Info Section (if logged in) */}
              {session && (
                <div className={`mobile-nav-item p-4 rounded-xl ${themeClasses.cardBg} border ${themeClasses.headerBorder} mb-6`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${themeClasses.logoGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {session.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`${themeClasses.text} font-semibold text-sm truncate`}>
                        {profile?.name || 'User'}
                      </p>
                      <p className={`${themeClasses.textMuted} text-xs truncate`}>
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="space-y-2">
                {/* Privacy Policy */}
                <button
                  onClick={() => {
                    setShowPolicyModal(true);
                    setIsMenuOpen(false);
                  }}
                  className={`mobile-nav-item w-full p-4 rounded-xl ${themeClasses.navHover} flex items-center gap-4 transition-all duration-300 group hover:shadow-lg`}
                >
                  <div className={`p-2 rounded-lg bg-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform duration-300`}>
                    <InformationCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`${themeClasses.text} font-medium text-sm`}>Privacy & Terms</span>
                    <p className={`${themeClasses.textMuted} text-xs mt-0.5`}>View our privacy policy</p>
                  </div>
                </button>

                {/* User Navigation Items */}
                {shouldShowUserIcons && (
                  <>
                    {/* Profile */}
                    <Link
                      to="/profile"
                      className={`mobile-nav-item w-full p-4 rounded-xl ${themeClasses.profileBtn} flex items-center gap-4 transition-all duration-300 group hover:shadow-lg`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className={`p-2 rounded-lg bg-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                        <UserCircleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`${themeClasses.text} font-medium text-sm`}>Profile</span>
                        <p className={`${themeClasses.textMuted} text-xs mt-0.5`}>Manage your account</p>
                      </div>
                    </Link>

                    {/* Admin Panel (if admin) */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={`mobile-nav-item w-full p-4 rounded-xl ${themeClasses.adminBtn} flex items-center gap-4 transition-all duration-300 group hover:shadow-lg`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`p-2 rounded-lg bg-green-500/20 group-hover:scale-110 transition-transform duration-300`}>
                          <Cog6ToothIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className={`${themeClasses.text} font-medium text-sm`}>Admin Panel</span>
                          <p className={`${themeClasses.textMuted} text-xs mt-0.5`}>Manage application</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600 font-medium`}>
                          Admin
                        </span>
                      </Link>
                    )}

                    {/* Divider */}
                    <div className={`my-4 border-t ${themeClasses.headerBorder}`}></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className={`mobile-nav-item w-full p-4 rounded-xl ${themeClasses.logoutBtn} flex items-center gap-4 transition-all duration-300 group hover:shadow-lg`}
                    >
                      <div className={`p-2 rounded-lg bg-red-500/20 text-red-500 group-hover:scale-110 transition-transform duration-300`}>
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`${themeClasses.text} font-medium text-sm`}>Logout</span>
                        <p className={`${themeClasses.textMuted} text-xs mt-0.5`}>Sign out of your account</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Not Logged In Message */}
                {!shouldShowUserIcons && !session && (
                  <div className={`mobile-nav-item p-6 rounded-xl ${themeClasses.cardBg} border ${themeClasses.headerBorder} text-center`}>
                    <div className="mb-3">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${themeClasses.logoGradient} flex items-center justify-center text-white shadow-lg`}>
                        <UserCircleIcon className="h-8 w-8" />
                      </div>
                    </div>
                    <h4 className={`${themeClasses.text} font-semibold mb-2`}>Welcome!</h4>
                    <p className={`${themeClasses.textMuted} text-sm mb-4`}>
                      Please log in to access more features and personalize your experience.
                    </p>
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${themeClasses.button} px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg inline-block`}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-auto pt-6 border-t border-opacity-20">
                <div className={`text-center ${themeClasses.textMuted}`}>
                  <p className="text-xs mb-2">
                    Made with ❤️ by WatchWithRadar Team
                  </p>
                  <p className="text-xs opacity-70">
                    Version 1.0.0 • September 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
