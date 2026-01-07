
"use client";

import { useState } from 'react';

export default function TestEmailButton() {
  const [status, setStatus] = useState('Idle');

  const runTest = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/send-payment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'support@ilovehaccp.com', // Send to yourself to avoid "unverified" error
          businessName: 'TEST BUSINESS',
          planId: 'test-plan-id', // Needs to be a valid UUID if we fetch from DB?
          amount: 79
        })
      });
      const data = await res.json();
      if (data.success) setStatus('Success! Check Inbox');
      else setStatus('Failed: ' + JSON.stringify(data.error));
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <div className="p-8 text-center">
      <button onClick={runTest} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold">
        Test Payment Email Logic
      </button>
      <p className="mt-4 font-mono">{status}</p>
    </div>
  );
}
