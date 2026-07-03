import React, { useState } from 'react';
import { Mail, MapPin, Phone, Globe, MessageSquare, Send, Check } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    // Simulate submission
    setSent(true);
    setTimeout(() => {
      setForm({ name: '', email: '', subject: '', message: '' });
      setSent(false);
    }, 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <MessageSquare className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Get in touch</h2>
        </div>
        <p className="text-sm text-slate-600">
          Contact the Biofeedback & Cognitive Neuroscience Laboratory at the Central University of Karnataka.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Location, contacts, map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Laboratory Directory
            </h3>

            <div className="space-y-4 text-sm text-slate-600">
              {/* Address */}
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-blue-950 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Address</strong>
                  <span className="leading-relaxed">
                    Department of Psychology,<br />
                    Central University of Karnataka (CUK),<br />
                    Aland Road, Kadaganchi, Kalaburagi,<br />
                    Karnataka 585311, India
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3 pt-2">
                <Mail className="h-5 w-5 text-blue-950 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Email Directory</strong>
                  <span>Lab Director: </span>
                  <a href="mailto:sarah.lin@cuk.ac.in" className="text-blue-950 hover:underline font-semibold">
                    sarah.lin@cuk.ac.in
                  </a>
                  <br />
                  <span>General Queries: </span>
                  <a href="mailto:info@cuk.ac.in" className="text-blue-950 hover:underline font-semibold">
                    info@cuk.ac.in
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-3 pt-2">
                <Phone className="h-5 w-5 text-blue-950 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Telephone</strong>
                  <span className="leading-relaxed">
                    +91 (08477) 226707<br />
                    <span className="text-xs text-slate-500 font-medium">Extension: 432 (Cognitive Lab)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Responsive Interactive Map */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-64 w-full">
              <iframe
                title="Central University of Karnataka Map"
                src="https://maps.google.com/maps?q=17.4321563,76.6739058&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between font-semibold">
              <span>📍 Kadaganchi Campus, Kalaburagi</span>
              <span>17.4322° N, 76.6739° E</span>
            </div>
          </div>

        </div>

        {/* Right Column: Contact message form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-6">
            Send a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="form-name" className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Name
              </label>
              <input
                id="form-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Sarah Lin"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="form-email" className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Email
              </label>
              <input
                id="form-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@cuk.ac.in"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="form-subject" className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Subject
              </label>
              <input
                id="form-subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="EEG Collaboration Request"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="form-message" className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Message
              </label>
              <textarea
                id="form-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your inquiry or collaborative interest..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 placeholder:text-slate-400 resize-y"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sent}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-950 ${
                  sent ? 'bg-emerald-600 hover:bg-emerald-600' : ''
                }`}
              >
                {sent ? (
                  <>
                    <Check className="h-4 w-4" /> Message Sent successfully
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
