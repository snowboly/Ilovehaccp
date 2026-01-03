export const metadata = {
  title: 'Refund Policy | ilovehaccp.com',
  description: 'Our refund policy for digital goods and subscriptions.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-pink-600 font-bold tracking-wider uppercase text-sm mb-2 block">Billing</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Refund Policy</h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Effective: January 3, 2026</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* The "Golden Rule" */}
            <section className="bg-pink-50 border border-pink-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                💳 The Short Version
              </h2>
              <p className="text-pink-800 leading-relaxed">
                Because our HACCP plans are digital products delivered instantly, <strong>all sales are final and non-refundable</strong> once the document has been generated or downloaded. Please review your free draft carefully before purchasing the final export.
              </p>
            </section>

            <Section 
              number="1"
              title="Digital Goods Policy"
              content={
                <p>
                   ilovehaccp.com sells "intangible irrevocable goods". Unlike a physical shirt you can return, a digital file cannot be "returned" once you have it. Therefore, we do not issue refunds for "change of mind" or "not liking the layout" after the purchase is complete.
                </p>
              }
              summary="Once you download it, you have it forever. We can't 'take it back', so we don't refund it."
            />

            <Section 
              number="2"
              title="When We DO Offer Refunds"
              content={
                <>
                  <p>We stand by our technology. We <strong>will</strong> issue a refund if:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Technical Failure:</strong> The file was corrupted, blank, or technically unusable, and our support team could not fix it within 48 hours.</li>
                    <li><strong>Double Charge:</strong> You were accidentally charged twice for the same transaction.</li>
                    <li><strong>Non-Delivery:</strong> You paid but the system never unlocked the feature (and support couldn't fix it).</li>
                  </ul>
                </>
              }
              summary="If our software breaks and we can't fix it, you get your money back. Period."
            />

             <Section 
              number="3"
              title="Subscription Cancellation"
              content={
                <p>
                  For any recurring billing plans (e.g. Enterprise):
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>You can cancel anytime via your dashboard.</li>
                    <li>Cancellation stops <strong>future</strong> charges.</li>
                    <li>It does not generate a refund for the <strong>current</strong> billing period (you retain access until the end of the month).</li>
                  </ul>
                </p>
              }
              summary="Cancel anytime. You won't be charged again, but we don't refund partial months."
            />

            <Section 
              number="4"
              title="Disputes & Chargebacks"
              content={
                <p>
                  We encourage you to contact us at <a href="mailto:billing@ilovehaccp.com">billing@ilovehaccp.com</a> before initiating a dispute with your bank. We are reasonable people. However, if you file a fraudulent chargeback (claiming "unauthorized" for a valid purchase), we reserve the right to ban your account and dispute the claim with evidence of your IP and download logs.
                </p>
              }
              summary="Talk to us first. We want to help."
            />

          </div>

          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Billing Support</h3>
                <p className="text-slate-500 text-sm mb-4">
                    Have a billing issue? We usually reply within 12 hours.
                </p>
                <a href="mailto:billing@ilovehaccp.com" className="block w-full text-center bg-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/20">
                  Email Billing
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
      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-pink-600">
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
