import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('Track Expenses');
  const [isVisible, setIsVisible] = useState({});
  const observerRef = useRef(null);

  // Typing animation for headline
  useEffect(() => {
    const phrases = ['Track Expenses', 'Set Budgets', 'Stay in Control'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      setTypedText(phrases[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all animated sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToApp = () => {
    navigate('/app');
  };

  return (
    <div className="bg-dark-bg text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">₹ BachatBro</div>
          <button
            onClick={navigateToApp}
            className="px-6 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl font-medium transition-all"
          >
            Open App
          </button>
        </div>
        <div className="gradient-line"></div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <span className="text-accent">✦</span>
            <span className="text-xs sm:text-sm text-secondary-text">Free Forever · No Database · Your Data</span>
          </div>

          {/* Headline with typing animation */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your finances.<br />
            Your Google Sheet.<br />
            <span className="text-accent transition-all duration-300">{typedText}.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-secondary-text max-w-2xl mx-auto mb-8">
            BachatBro connects to your own Google Sheet so your financial data never touches our servers. 
            Track expenses, set budgets, and stay in control.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={navigateToApp}
              className="btn-primary text-lg px-8 py-4 w-full sm:w-auto pulse-animation"
            >
              Start Tracking Free
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
            >
              See How It Works
            </button>
          </div>

          {/* Trust Text */}
          <p className="text-xs sm:text-sm text-secondary-text">
            No credit card · No signup fees · Works with free Google account
          </p>
        </div>

        {/* Dashboard Mockup with float animation */}
        <div className="mt-16 max-w-6xl mx-auto relative w-full float-animation">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
          <div className="relative card p-2">
            <div className="bg-dark-bg rounded-xl p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">Good morning, User</div>
                  <div className="text-sm text-secondary-text">Your financial overview for February 2026</div>
                </div>
                <button className="btn-primary text-sm sm:text-base">Record Expense</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card-bg p-4 sm:p-6 rounded-2xl border border-white/5">
                  <div className="text-secondary-text text-xs sm:text-sm mb-2">Total Balance</div>
                  <div className="text-2xl sm:text-3xl font-bold text-success">₹45,200</div>
                </div>
                <div className="bg-card-bg p-4 sm:p-6 rounded-2xl border border-white/5">
                  <div className="text-secondary-text text-xs sm:text-sm mb-2">Monthly Income</div>
                  <div className="text-2xl sm:text-3xl font-bold text-success">₹80,000</div>
                </div>
                <div className="bg-card-bg p-4 sm:p-6 rounded-2xl border border-white/5">
                  <div className="text-secondary-text text-xs sm:text-sm mb-2">Monthly Expenses</div>
                  <div className="text-2xl sm:text-3xl font-bold text-danger">₹34,800</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6" data-animate>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Simple by design</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div 
              id="step-1"
              data-animate
              className={`card p-8 border-t-4 border-accent ${isVisible['step-1'] ? 'fade-up-animation' : 'opacity-0'}`}
              style={{ animationDelay: '0ms' }}
            >
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold mb-3">Sign in with Google</h3>
              <p className="text-secondary-text">
                One click authentication. We only request Google Sheets access, nothing else.
              </p>
            </div>

            {/* Step 2 */}
            <div 
              id="step-2"
              data-animate
              className={`card p-8 border-t-4 border-accent ${isVisible['step-2'] ? 'fade-up-animation' : 'opacity-0'}`}
              style={{ animationDelay: '150ms' }}
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Connect your Sheet</h3>
              <p className="text-secondary-text">
                Point to any Google Sheet or let us create one. Your data, your file, your control.
              </p>
            </div>

            {/* Step 3 */}
            <div 
              id="step-3"
              data-animate
              className={`card p-8 border-t-4 border-accent ${isVisible['step-3'] ? 'fade-up-animation' : 'opacity-0'}`}
              style={{ animationDelay: '300ms' }}
            >
              <div className="text-5xl mb-4">₹</div>
              <h3 className="text-2xl font-bold mb-3">Start tracking</h3>
              <p className="text-secondary-text">
                Add expenses, set budgets, view analytics. Everything syncs instantly to your sheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-sidebar-bg" data-animate>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '📈', title: 'Budget Tracking', desc: 'Set monthly budgets per category, get warned before you overspend', id: 'feature-1' },
              { icon: '🗂️', title: 'Category Analysis', desc: 'Understand exactly where your money goes each month', id: 'feature-2' },
              { icon: '📅', title: 'Transaction History', desc: 'Full searchable history with filters by category, method, date', id: 'feature-3' },
              { icon: '💡', title: 'Need vs Want', desc: 'Automatically classify spending and aim for the 50/30/20 rule', id: 'feature-4' },
              { icon: '🔄', title: 'Real-time Sync', desc: 'Every entry goes directly to your Google Sheet instantly', id: 'feature-5' },
              { icon: '🌙', title: 'Works Offline', desc: 'Your sheet is always accessible even when the app is down', id: 'feature-6' },
            ].map((feature, index) => (
              <div
                key={feature.id}
                id={feature.id}
                data-animate
                className={`card p-6 feature-card-hover ${isVisible[feature.id] ? 'fade-up-animation' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-secondary-text">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Focus */}
      <section className="py-20 px-6" style={{ backgroundColor: '#0D1117' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <div className="inline-block px-4 py-2 bg-accent/20 border border-accent/30 rounded-full text-accent text-sm font-medium mb-4">
                Privacy First
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">We never see your financial data</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-success text-xl flex-shrink-0">✓</div>
                  <div className="text-secondary-text">Data stored in YOUR Google account</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-success text-xl flex-shrink-0">✓</div>
                  <div className="text-secondary-text">We have no database of user transactions</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-success text-xl flex-shrink-0">✓</div>
                  <div className="text-secondary-text">Logout anytime, your sheet stays yours</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-success text-xl flex-shrink-0">✓</div>
                  <div className="text-secondary-text">Open source - verify our claims yourself</div>
                </div>
              </div>
            </div>

            {/* Right Side - Diagram */}
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="flex items-center space-x-4">
                <div className="card p-6 text-center">
                  <div className="text-4xl mb-2">💻</div>
                  <div className="font-bold text-sm">BachatBro App</div>
                </div>
                <div className="text-3xl text-success">→</div>
                <div className="card p-6 text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="font-bold text-sm">Your Google Sheet</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl text-danger mb-2">✗</div>
                <div className="text-secondary-text text-sm">No Server Database</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start in 60 seconds</h2>
          <p className="text-lg sm:text-xl text-secondary-text mb-8">Free Google account is all you need</p>
          <button
            onClick={navigateToApp}
            className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 mb-6 w-full sm:w-auto pulse-animation"
          >
            Open BachatBro Free
          </button>
          <div className="text-sm sm:text-base text-secondary-text">
            Already using it? →{' '}
            <button onClick={navigateToApp} className="text-accent hover:text-accent/80 underline">
              Open App
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-secondary-text">
              BachatBro · Personal Finance · Made in India 🇮🇳
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => scrollToSection('how-it-works')} className="text-secondary-text hover:text-white">
                How it works
              </button>
              <button onClick={navigateToApp} className="text-secondary-text hover:text-white">
                Open App
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-secondary-text">
            Your data never leaves your Google account
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
