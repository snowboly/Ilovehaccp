"use client";

import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send email would go here
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
          <p className="mt-4 text-lg text-slate-500">
            Questions about our Enterprise plans or need audit support? We're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-500">support@ilovehaccp.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Phone</p>
                    <p className="text-slate-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Office</p>
                    <p className="text-slate-500">123 Safety Way, Food Tech City</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                <p className="text-slate-500 mt-2">We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>General Inquiry</option>
                    <option>Enterprise / Custom Plan</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea required rows={4} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How can we help you?" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
