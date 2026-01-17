export const metadata = {
  title: 'Cookie Policy | ilovehaccp.com',
  description: 'Our transparent approach to cookies, local storage, and user tracking.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Data Protection</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Cookie Policy</h1>
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
                🍪 Our "No-Nonsense" Approach
              </h2>
              <p className="text-green-800 leading-relaxed">
                We hate cookie banners as much as you do. <strong>We do not use invasive tracking pixels (like Facebook Pixel) or sell your browsing history to ad networks.</strong> We only use cookies that are strictly necessary to make the app work and to understand basic usage patterns anonymously.
              </p>
            </section>

            <Section 
              number="1"
              title="What Are Cookies?"
              content={
                <p>
                  Cookies are tiny text files stored on your device when you visit a website. They act like a "memory" for the site, helping it recognize you when you come back or keeping you logged in as you navigate between pages. We also use <strong>Local Storage</strong>, which is a modern version of cookies that allows us to save your unfinished HACCP plan directly on your device so you don't lose your work.
                </p>
              }
              summary="Tiny files that help the website remember who you are and save your work."
            />

            <Section 
              number="2"
              title="Strictly Essential Cookies"
              content={
                <>
                  <p>These are required for the website to function. You cannot switch these off in our systems.</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Authentication (`sb-access-token`):</strong> Keeps you securely logged in via Supabase.</li>
                    <li><strong>Wizard State (`haccp_builder_state`):</strong> Saves your progress in the form so you can refresh the page without starting over.</li>
                    <li><strong>Security (`csrf-token`):</strong> Protects your account from malicious attacks (Cross-Site Request Forgery).</li>
                    <li><strong>Payments (`stripe.com`):</strong> Used by our payment processor to securely handle transactions.</li>
                  </ul>
                </>
              }
              summary="The bare minimum needed to log in, pay, and build your plan."
            />

             <Section 
              number="3"
              title="Performance & Analytics (Optional)"
              content={
                <p>
                  With your consent, we use privacy-focused analytics tools (such as PostHog) to understand how our website is used. We track metrics like:
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Which articles are most read?</li>
                    <li>How long does it take to complete the wizard?</li>
                    <li>Are users encountering errors on mobile devices?</li>
                  </ul>
                  <strong>This data is aggregated and anonymized.</strong> These cookies are not set unless you accept them via our cookie banner.
                </p>
              }
              summary="We check broad trends to fix bugs, but only if you say yes."
            />

            <Section 
              number="4"
              title="Managing Cookies"
              content={
                <p>
                  Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
                </p>
              }
              summary="You can block cookies in your browser, but the website might break (e.g., you won't stay logged in)."
            />

            <Section 
              number="5"
              title="Updates to This Policy"
              content={
                <p>
                  We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
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
                  <a href="#" className="block hover:text-green-600 transition-colors">1. What Are Cookies?</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">2. Essential Cookies</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">3. Analytics</a>
                  <a href="#" className="block hover:text-green-600 transition-colors">4. Management</a>
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
