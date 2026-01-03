export const metadata = {
  title: 'Terms of Service | ilovehaccp.com',
  description: 'Terms and conditions for using our AI-powered HACCP builder.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Legal Information</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Effective: January 3, 2026</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Version 2.1</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Section 0: Critical AI Disclaimer */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                ⚠️ Critical Disclaimer: Artificial Intelligence
              </h2>
              <div className="prose prose-amber prose-sm max-w-none">
                <p>
                  <strong>This is the most important part of these terms.</strong> ilovehaccp.com uses Artificial Intelligence (LLMs) to draft your documents. While powerful, AI can "hallucinate" (make mistakes).
                </p>
                <p>
                  <strong>You acknowledge that:</strong>
                </p>
                <ul>
                  <li>The output is a <strong>draft/template</strong> only.</li>
                  <li>The AI is <strong>not</strong> a certified food safety consultant or lawyer.</li>
                  <li><strong>You maintain 100% responsibility</strong> for verifying every temperature, critical limit, and procedure against your local laws (e.g., FDA, EFSA, FSA).</li>
                  <li>We are a software provider, not a food safety guarantor.</li>
                </ul>
              </div>
            </section>

            <Section 
              number="1"
              title="Acceptance of Terms"
              content={
                <p>
                  By accessing ilovehaccp.com ("Service"), creating an account, or purchasing a plan, you agree to be bound by these Terms. If you do not agree, you must stop using the Service immediately. These terms constitute a legally binding agreement between you ("User") and ilovehaccp.com ("Company", "We").
                </p>
              }
              summary="If you use the site, you agree to the rules. If you don't agree, please don't use the site."
            />

            <Section 
              number="2"
              title="The Service & No Professional Advice"
              content={
                <>
                  <p>
                    The Service provides software tools to assist in the creation of food safety documentation. It does not provide medical, legal, or certified food safety advice. The Service is not a substitute for hiring a qualified Food Safety Consultant or verifying compliance with your local Environmental Health Officer (EHO).
                  </p>
                  <p className="mt-4">
                    We explicitly disclaim any warranty that the documents generated will guarantee a pass on any specific audit (BRCGS, SQF, ISO 22000, or local inspection). Compliance relies on your physical implementation of the plan, not just the paperwork.
                  </p>
                </>
              }
              summary="We provide the software 'pen', you write the safety story. We aren't your lawyer or your health inspector."
            />

            <Section 
              number="3"
              title="User Responsibilities"
              content={
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Accuracy:</strong> You are responsible for the accuracy of the data you input (ingredients, processes).</li>
                  <li><strong>Verification:</strong> You must review every line of the generated plan. If the AI suggests cooking chicken to 50°C, and your local law requires 75°C, you must correct it.</li>
                  <li><strong>Security:</strong> You are responsible for keeping your account credentials secure.</li>
                  <li><strong>Lawful Use:</strong> You may not use the Service to generate fraudulent or misleading compliance documents.</li>
                </ul>
              }
              summary="You input the data, you check the output, and you keep your password safe. Don't fake safety records."
            />

            <Section 
              number="4"
              title="Intellectual Property Rights"
              content={
                <>
                  <p>
                    <strong>Our IP:</strong> The software, code, design, and AI prompt engineering are the exclusive property of ilovehaccp.com.
                  </p>
                  <p className="mt-4">
                    <strong>Your Output:</strong> Upon payment, you are granted a perpetual, non-exclusive, worldwide license to use the generated HACCP documents for your business operations. You own the specific plan you created.
                  </p>
                  <p className="mt-4">
                    <strong>Restrictions:</strong> You may not resell the generated plans as a service to third parties (e.g., acting as a consultant using our tool) without an Enterprise Agency license.
                  </p>
                </>
              }
              summary="We own the tool. You own the plan you build. You can't resell our plans to others without a special license."
            />

            <Section 
              number="5"
              title="Limitation of Liability"
              content={
                <p className="uppercase text-sm font-bold tracking-wide">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ILOVEHACCP.COM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS. WE ARE SPECIFICALLY NOT LIABLE FOR ANY FOODBORNE ILLNESS, BUSINESS CLOSURE, OR REGULATORY FINES RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
              }
              summary="We cap our liability at what you paid us. We aren't liable if you get fined or someone gets sick—that's your operational responsibility."
            />

            <Section 
              number="6"
              title="Termination"
              content={
                <p>
                  We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
                </p>
              }
              summary="Play nice or we can ban you."
            />

             <Section 
              number="7"
              title="Contact"
              content={
                <p>
                  For legal notices: <a href="mailto:support@ilovehaccp.com" className="text-blue-600 hover:underline">support@ilovehaccp.com</a>
                </p>
              }
            />

          </div>

          {/* Sidebar Navigation (Sticky) */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Quick Navigation</h3>
                <nav className="space-y-3 text-sm font-medium text-slate-500">
                  <a href="#" className="block hover:text-blue-600 transition-colors">1. Acceptance</a>
                  <a href="#" className="block hover:text-blue-600 transition-colors">2. No Professional Advice</a>
                  <a href="#" className="block hover:text-blue-600 transition-colors">3. User Responsibilities</a>
                  <a href="#" className="block hover:text-blue-600 transition-colors">4. Intellectual Property</a>
                  <a href="#" className="block hover:text-blue-600 transition-colors">5. Liability</a>
                </nav>
              </div>
              
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                <h3 className="font-bold mb-2">Need help?</h3>
                <p className="text-blue-100 text-sm mb-4">If you have questions about these terms, our support team is available.</p>
                <a href="mailto:support@ilovehaccp.com" className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                  Contact Legal
                </a>
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