import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  BellIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '../components/Icons';
import './LandingPage.css';

export default function LandingPage() {
  const [animationStage, setAnimationStage] = useState('initial'); // 'initial' -> 'flying' -> 'settled'

  useEffect(() => {
    // Phase 1 (1.5s dot -> big) + Phase 2 (1.5s stay still) = 3.0s total before flying
    const timer1 = setTimeout(() => {
      setAnimationStage('flying');
    }, 3000);

    // Phase 3 (3.0s to 3.8s fly to header) -> settled
    const timer2 = setTimeout(() => {
      setAnimationStage('settled');
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="landing-page-container">
      
      {/* Centered Big Vignan Logo Intro Overlay (Dot -> Big Logo 1.5s -> Still 1.5s -> Header Glide) */}
      {animationStage !== 'settled' && (
        <div className={`vignan-center-intro-overlay ${animationStage}`}>
          <div className="vignan-big-logo-box">
            <img src="/vignan_logo.png" alt="Vignan College" className="vignan-big-img" />
          </div>
        </div>
      )}

      {/* Hero Section with Campus Background Image (~10% Blur) */}
      <section className="landing-hero-wrapper">
        <div className="landing-hero-bg" />
        <div className="landing-hero-overlay" />

        {/* Navigation Bar */}
        <header className="landing-navbar">
          <div className="landing-navbar-inner">
            
            {/* Vignan Logo + NotifyHub Dual Brand Header */}
            <div className="landing-brand-group">
              <div className={`vignan-logo-wrapper ${animationStage === 'settled' ? 'is-settled' : 'is-waiting'}`}>
                <img 
                  src="/vignan_logo.png" 
                  alt="Vignan Logo" 
                  className="vignan-logo-img" 
                />
                <div className="settle-pulse-ring" />
              </div>
              
              <span className="brand-divider"></span>
              
              <Link to="/" className="landing-logo">
                <Logo size="medium" />
              </Link>
            </div>

            <nav className="landing-nav-menu">
              <a href="#about">About NotifyHub</a>
              <a href="#features">What's Inside</a>
              <a href="#benefits">Student Benefits</a>
            </nav>

            <div className="landing-nav-cta">
              <Link to="/login" className="nav-btn-login">
                Student Login
              </Link>
              <Link to="/register" className="nav-btn-register">
                Register <ArrowRightIcon className="btn-icon" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Main Content */}
        <div className="landing-hero-content">
          <div className="hero-badge">
            <SparklesIcon className="badge-icon" /> Empowering Campus Communication
          </div>
          
          <h1 className="hero-title">
            Your Campus. Your Circulars. <br />
            <span className="hero-gradient-text">Unified in Real-Time.</span>
          </h1>

          <p className="hero-description">
            NotifyHub is the central digital hub built for students. Get department-specific circulars, exam timetables, campus placement alerts, and direct administrative support — all in one clean, instant dashboard.
          </p>

          <div className="hero-action-buttons">
            <Link to="/login" className="hero-main-btn">
              <BellIcon className="btn-icon" /> Access Student Hub
            </Link>
            <Link to="/register" className="hero-secondary-btn">
              <UserGroupIcon className="btn-icon" /> Create Student Profile
            </Link>
          </div>

          <div className="hero-trust-banner">
            <CheckCircleIcon className="trust-icon" />
            <span>Never miss an important exam fee, hall ticket release, or placement drive again.</span>
          </div>
        </div>
      </section>

      {/* Section 1: About & Purpose (Informative Section) */}
      <section id="about" className="landing-section-block">
        <div className="landing-section-header">
          <span className="section-kicker-tag">CAMPUS PROBLEM SOLVED</span>
          <h2 className="section-heading-title">Why Students Need NotifyHub</h2>
          <p className="section-heading-sub">
            Traditional campus notice boards, flooded email lists, and chaotic messaging groups often lead to missed deadlines and confusion. NotifyHub replaces the clutter with a single, verified institutional feed.
          </p>
        </div>

        <div className="info-cards-grid">
          <div className="info-card-item">
            <div className="info-card-icon red-bg">
              <BellIcon />
            </div>
            <h3>Zero Missed Deadlines</h3>
            <p>
              Critical exam fee submission dates, hall ticket downloads, and fee receipt submissions are highlighted with high-priority notifications so you stay on schedule.
            </p>
          </div>

          <div className="info-card-item">
            <div className="info-card-icon purple-bg">
              <DocumentTextIcon />
            </div>
            <h3>Department & Year Filtered Feed</h3>
            <p>
              Receive only circulars relevant to your exact branch (CSE, ECE, EEE, MECH, CIVIL, IT, AI&DS) and academic year. No clutter or spam from other departments.
            </p>
          </div>

          <div className="info-card-item">
            <div className="info-card-icon green-bg">
              <ChatBubbleLeftRightIcon />
            </div>
            <h3>Direct Administrative Desk</h3>
            <p>
              Have questions regarding hall tickets, electives, or certificates? Raise a query online and receive official responses without standing in long admin queues.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: What's Inside (Detailed Modules) */}
      <section id="features" className="landing-section-block elevated-bg">
        <div className="landing-section-header">
          <span className="section-kicker-tag">PLATFORM MODULES</span>
          <h2 className="section-heading-title">What's Inside NotifyHub</h2>
          <p className="section-heading-sub">
            Designed from the ground up for modern college students to streamline academic information.
          </p>
        </div>

        <div className="modules-grid">
          <div className="module-card">
            <div className="module-top">
              <span className="module-tag urgent">IMPORTANT CIRCULARS</span>
              <BellIcon className="module-icon" />
            </div>
            <h3>Official Announcement Hub</h3>
            <p>
              Browse verified announcements categorized under Academic, Exams, Placements, Workshops, and General events. High-priority circulars trigger urgent notice banners.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-tag event">CAMPUS EVENTS</span>
              <CalendarIcon className="module-icon" />
            </div>
            <h3>Interactive Event Calendar</h3>
            <p>
              Stay updated on upcoming technical symposia, hackathons, placement drives, and cultural fests. Check registration deadlines and venue details in one click.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-tag query">STUDENT SUPPORT</span>
              <ChatBubbleLeftRightIcon className="module-icon" />
            </div>
            <h3>Digital Query System</h3>
            <p>
              Submit queries directly to campus staff and track resolution progress (Open to Resolved). Get official answers directly on your student portal.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-tag student">PERSONALIZED</span>
              <AcademicCapIcon className="module-icon" />
            </div>
            <h3>Personal Student Profile</h3>
            <p>
              Store your roll number, year, and department preferences so all notifications, calendar entries, and queries remain tailored specifically to your academic journey.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Student Benefits */}
      <section id="benefits" className="landing-section-block">
        <div className="landing-section-header">
          <span className="section-kicker-tag">STUDENT ADVANTAGE</span>
          <h2 className="section-heading-title">How NotifyHub Helps You Succeed</h2>
          <p className="section-heading-sub">
            Empowering your daily academic life with clarity, organization, and speed.
          </p>
        </div>

        <div className="benefits-list-box">
          <div className="benefit-item">
            <div className="benefit-number">01</div>
            <div>
              <h3>100% Official & Verified Notices</h3>
              <p>Eliminate rumors and unverified forward messages. Every notice is published directly by authorized campus staff.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-number">02</div>
            <div>
              <h3>Effortless Academic Organization</h3>
              <p>Keep your exam timetables, event calendars, and support queries in one central digital hub accessible anytime on phone or desktop.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-number">03</div>
            <div>
              <h3>Save Time & Avoid Queues</h3>
              <p>No more searching physical notice boards or waiting in administrative offices. Everything is right at your fingertips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Explicit Copyright */}
      <footer className="landing-professional-footer">
        <div className="footer-inner-content">
          <Logo size="medium" />
          <p className="footer-description">The modern campus announcement and student event platform.</p>

          <div className="footer-quick-links">
            <Link to="/login">Student Login</Link>
            <Link to="/register">Create Account</Link>
            <a href="#about">About</a>
            <a href="#benefits">Benefits</a>
          </div>

          <div className="footer-copyright-statement">
            © {new Date().getFullYear()} NotifyHub. Made by Mohammad Haneef
          </div>
        </div>
      </footer>

    </div>
  );
}
