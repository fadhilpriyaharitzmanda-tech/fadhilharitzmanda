import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { personalInfo, socialLinks } from '../data/portfolioData';

const socialIcons = {
  GitHub: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  LinkedIn: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  ),
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
};

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Please fill in your name';
    }
    if (!form.email.trim()) {
      errs.email = 'Please fill in your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Invalid email format (e.g. name@domain.com)';
    }
    if (!form.message.trim()) {
      errs.message = 'Please enter your message';
    } else if (form.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      await emailjs.send(
        'service_8x6z37m',
        'template_g4r6j8c',
        {
          from_name: form.name,
          reply_to: form.email,
          sent_at: new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          message: form.message,
          to_name: personalInfo.name,
        },
        'zKVX1QMfXWK-EpDIL'
      );

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setErrors({});
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setErrorMessage(err?.text || 'Failed to send message. Please try again or email directly.');
    }
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 mb-32 scroll-mt-28" id="contact">
      <div className="mb-8 reveal-pop">
        <h2 className="font-headline-md text-headline-md text-on-surface bg-brick-yellow border-4 border-on-surface px-4 py-2 inline-block w-fit brick-shadow uppercase">
          CONTACT
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="reveal-left delay-100">
          <h3 className="font-display-lg text-on-surface uppercase mb-4 leading-tight text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg">
            LET'S BUILD
            <br />
            <span className="text-primary">SOMETHING TOGETHER</span>
          </h3>

          <p className="font-body-lg text-on-surface mb-6 text-body-lg leading-relaxed">
            Have a project in mind, an opportunity to discuss, or just want to connect? Send me a message or find me on social media!
          </p>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${personalInfo.email}&su=Let's%20Connect&body=Hi%20Fadhil%2C%0A%0AI%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you%20regarding...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3.5 bg-brick-yellow text-on-surface border-4 border-on-surface brick-btn mb-8 relative select-none cursor-pointer group"
            title="Click to send email directly via Gmail"
          >
            <div className="absolute -top-2.5 left-0 w-full flex justify-around px-3 pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-brick-yellow border-2 border-on-surface" />
              <span className="w-3 h-3 rounded-full bg-brick-yellow border-2 border-on-surface" />
              <span className="w-3 h-3 rounded-full bg-brick-yellow border-2 border-on-surface" />
            </div>
            <span className="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">
              rocket_launch
            </span>
            <span className="font-button-text text-sm sm:text-base font-bold uppercase tracking-wide">
              Hire me to unlock my potential
            </span>
            <span className="material-symbols-outlined text-on-surface text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>

          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const IconComp = socialIcons[social.name];
              return (
                <a
                  key={social.name}
                  className="w-14 h-14 bg-white text-on-surface border-4 border-on-surface brick-shadow hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1a1c1c] transition-all inline-flex items-center justify-center rounded-xl cursor-pointer group"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                >
                  {IconComp && (
                    <IconComp className="w-6 h-6 fill-current text-on-surface group-hover:scale-110 transition-transform" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="brick-card p-8 bg-white relative reveal-right delay-200">
          <div className="absolute -top-3 left-8 flex gap-6 px-2 pointer-events-none z-20">
            <span className="w-6 h-6 rounded-full bg-white border-2 border-on-surface" />
            <span className="w-6 h-6 rounded-full bg-white border-2 border-on-surface" />
            <span className="w-6 h-6 rounded-full bg-white border-2 border-on-surface" />
          </div>

          {status === 'success' ? (
            <div className="pt-6 pb-4 flex flex-col items-center text-center gap-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-brick-yellow border-4 border-on-surface flex items-center justify-center brick-shadow">
                <span className="material-symbols-outlined text-on-surface text-[32px]">check_circle</span>
              </div>
              <h4 className="font-headline-md text-on-surface uppercase text-xl">MESSAGE DELIVERED!</h4>
              <p className="font-body-md text-on-surface-variant max-w-sm text-sm">
                Thank you for reaching out! Your message has been sent successfully to {personalInfo.name}. I'll get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2.5 bg-primary text-white border-2 border-on-surface font-button-text text-xs uppercase brick-btn cursor-pointer"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
              {status === 'error' && (
                <div className="p-3 bg-red-100 border-3 border-primary text-primary text-xs font-bold font-label-caps flex items-center gap-2 shadow-[3px_3px_0px_0px_#ba1a1a] animate-shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps font-bold text-on-surface uppercase text-xs" htmlFor="name">
                    Your Name
                  </label>
                  {errors.name && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-primary border-2 border-primary font-label-caps text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#ba1a1a] animate-fadeIn select-none">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.name}
                    </span>
                  )}
                </div>
                <input
                  className={`border-3 border-on-surface p-3.5 font-body-md bg-surface-container transition-all brick-shadow text-sm focus:outline-none focus:bg-white focus:border-brick-blue focus:shadow-[6px_6px_0px_0px_#1a1c1c] ${
                    errors.name ? 'border-primary bg-red-50/60 shadow-[3px_3px_0px_0px_#ba1a1a] animate-shake' : ''
                  }`}
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  type="text"
                  autoComplete="name"
                />
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps font-bold text-on-surface uppercase text-xs" htmlFor="email">
                    Your Email
                  </label>
                  {errors.email && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-primary border-2 border-primary font-label-caps text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#ba1a1a] animate-fadeIn select-none">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.email}
                    </span>
                  )}
                </div>
                <input
                  className={`border-3 border-on-surface p-3.5 font-body-md bg-surface-container transition-all brick-shadow text-sm focus:outline-none focus:bg-white focus:border-brick-blue focus:shadow-[6px_6px_0px_0px_#1a1c1c] ${
                    errors.email ? 'border-primary bg-red-50/60 shadow-[3px_3px_0px_0px_#ba1a1a] animate-shake' : ''
                  }`}
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  type="text"
                  autoComplete="email"
                />
              </div>

              {/* Message field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps font-bold text-on-surface uppercase text-xs" htmlFor="message">
                    Your Message
                  </label>
                  {errors.message && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-primary border-2 border-primary font-label-caps text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#ba1a1a] animate-fadeIn select-none">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.message}
                    </span>
                  )}
                </div>
                <textarea
                  className={`border-3 border-on-surface p-3.5 font-body-md bg-surface-container transition-all brick-shadow min-h-[120px] text-sm focus:outline-none focus:bg-white focus:border-brick-blue focus:shadow-[6px_6px_0px_0px_#1a1c1c] ${
                    errors.message ? 'border-primary bg-red-50/60 shadow-[3px_3px_0px_0px_#ba1a1a] animate-shake' : ''
                  }`}
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="What would you like to build or discuss?"
                />
              </div>

              {/* Submit button */}
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary font-button-text text-button-text brick-btn uppercase relative mt-2 w-full cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={status === 'sending'}
              >
                <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                </div>
                {status === 'sending' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    SEND MESSAGE
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

