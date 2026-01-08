export const metadata = {
  title: 'Privacy Policy | ilovehaccp.com',
  description: 'How we handle your data, our zero-training technology policy, and your GDPR rights.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Data Protection</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Effective: January 3, 2026</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Version 2.0</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Critical Privacy Promise */}
            <section className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                🔒 Our Core Privacy Promise: No Model Training
              </h2>
              <p className="text-green-800 leading-relaxed">
                We know your recipes and processes are your trade secrets. <strong>We strictly do NOT use your specific proprietary data to train, fine-tune, or improve our public proprietary models.</strong> Your data is isolated and used solely to generate your requested documents.
              </p>
            </section>

            <Section 
              number="1"
              title="Data We Collect"
              content={
                <>
                  <p>We collect two types of information:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Account Data:</strong> Name, email, and billing history (handled via Stripe). We do not store credit card numbers.</li>
                    <li><strong>Operational Data:</strong> The specific inputs you provide to the HACCP builder (ingredients, equipment, staff names, process flows).</li>
                  </ul>
                </>
              }
              summary="We collect your login info and the stuff you type into the builder. That's it."
            />

            <Section 
              number="2"
              title="How We Use Your Data"
              content={
                <p>
                  Your data is used for one primary purpose: <strong>to provide the Service.</strong> This includes:
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Generating your HACCP plan via our technology providers (Groq/OpenAI).</li>
                    <li>Sending you transactional emails (receipts, password resets).</li>
                    <li>Improving the UX of the platform (analytics on <em>how</em> features are used, not <em>what</em> is written).</li>
                  </ul>
                </p>
              }
              summary="We use your data to build your plan and keep the lights on. We don't sell it."
            />

             <Section 
              number="3"
              title="Technology & Third-Party Processing"
              content={
                <>
                  <p>
                    We use trusted third-party APIs to power our intelligence. When you click "Generate":
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Your text prompt is sent securely (TLS 1.3 encryption) to our inference partners (Groq Inc. or OpenAI).</li>
                    <li>These partners are contractually bound <strong>not</strong> to retain your data for model training.</li>
                    <li>Your data is ephemeral in their systems and persists only long enough to return the response.</li>
                  </ul>
                </>
              }
              summary="We send your text to our secure partners to get the result, but they aren't allowed to keep it or learn from it."
            />

            <Section 
              number="4"
              title="Data Retention"
              content={
                <p>
                  We store your generated plans in your secure dashboard indefinitely so you can access, edit, and re-download them. You may request the deletion of your account and all associated data at any time by contacting support or using the delete function in your dashboard.
                </p>
              }
              summary="We keep your plans until you tell us to delete them."
            />

            <Section 
              number="5"
              title="Your Rights (GDPR & CCPA)"
              content={
                <p>
                  Under laws like GDPR and CCPA, you have the right to:
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Access</strong> all data we hold on you.</li>
                    <li><strong>Rectify</strong> any errors in your data.</li>
                    <li><strong>Erase</strong> ("Right to be Forgotten") all your data.</li>
                    <li><strong>Export</strong> your data in a portable format.</li>
                  </ul>
                  To exercise these rights, simply email support@ilovehaccp.com.
                </p>
              }
              summary="You own your data. You can see it, fix it, or delete it whenever you want."
            />

            <Section 
              number="6"
              title="Contact"
              content={
                <p>
                  Data Protection Officer (DPO): <a href="mailto:support@ilovehaccp.com" className="text-blue-600 hover:underline">support@ilovehaccp.com</a>
                </p>
              }
            />

          </div>

          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Contents</h3>
                <nav className="space-y-3 text-sm font-medium text-slate-500">
                  <a href="#" className="block hover:text-green-600 transition-colors">1. Data Collection</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">2. Data Usage</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">3. Technology Partners</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">4. Retention</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">5. Your Rights</a>
                </nav>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ number, title, content, summary }: any) {
  return (
    <div className="group relative">
      <div className="absolute -left-12 top-0 text-slate-200 font-black text-6xl opacity-50 select-none hidden xl:block">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <span className="bg-slate-100 text-slate-500 text-sm px-2 py-1 rounded-md font-mono xl:hidden">#{number}</span>
        {title}
      </h2>
      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-blue-600">
        {content}
      </div>
      {summary && (
        <div className="mt-6 bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg">
          <p className="text-sm text-slate-600 font-medium m-0">
            <span className="uppercase text-xs font-bold text-slate-400 tracking-wider block mb-1">Plain English Summary</span>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
