export const metadata = {
  title: 'Refund & Cancellation Policy | ilovehaccp.com',
  description: 'Our policy regarding refunds, cancellations, and digital product delivery.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600">
        <h1 className="text-4xl font-extrabold mb-4">Refund & Cancellation Policy</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-8 border-b pb-8">
          <span>Effective Date: December 30, 2025</span>
          <span>•</span>
          <span>Strictly Enforced</span>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 not-prose rounded-r-xl">
          <h3 className="text-blue-800 font-bold text-lg mb-2">Summary for Quick Reference</h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            <strong>ilovehaccp.com</strong> sells non-tangible, irrevocable digital goods (AI-generated documents). 
            Therefore, <strong>we do not issue refunds once the order is accomplished and the document is sent/generated.</strong> 
            Please review your inputs carefully before purchasing.
          </p>
        </div>

        <h2>1. Digital Products Policy</h2>
        <p>
          Because our products are digital files (PDF, JSON, DOCX) that are generated and delivered instantly, they are deemed "used" upon delivery. Unlike physical goods, they cannot be returned. 
          By purchasing a plan, you acknowledge and agree that:
        </p>
        <ul>
          <li>You lose your right of withdrawal once the digital content has started to be delivered (i.e., when you click "Generate" or "Download").</li>
          <li>All purchases are final and non-refundable.</li>
        </ul>

        <h2>2. Exceptional Circumstances</h2>
        <p>
          We may, at our sole discretion, honor requests for a refund on the following grounds ONLY:
        </p>
        <ul>
          <li><strong>Non-delivery of the product:</strong> Due to mailing issues or a server failure, you did not receive your plan. In this case, we recommend contacting us for assistance first. Claims for non-delivery must be submitted within 7 days from the order placing date.</li>
          <li><strong>Major technical defects:</strong> Although all the products are thoroughly tested, unexpected errors may occur. If the AI engine fails to generate a readable file or generates a corrupted file, and our support team cannot fix it within 48 hours, a refund may be issued.</li>
        </ul>
        <p>
          <strong>Note:</strong> "Not liking" the AI's phrasing or regulatory style is NOT considered a technical defect. The user has the ability to edit the generated content.
        </p>

        <h2>3. Subscription Cancellations</h2>
        <p>
          For recurring subscriptions (e.g., Enterprise or Maintenance plans):
        </p>
        <ul>
          <li>You may cancel your subscription at any time from your Dashboard.</li>
          <li>Cancellation stops future billing. It does not refund previous months.</li>
          <li>You will retain access to your documents until the end of the current billing cycle.</li>
        </ul>

        <h2>4. Chargebacks and Disputes</h2>
        <p>
          If you initiate a dispute or chargeback with your bank without contacting us first, we reserve the right to:
        </p>
        <ul>
          <li>Immediately suspend your account and revoke access to all generated documents.</li>
          <li>Ban your IP address and billing details from future use of our service.</li>
          <li>Submit evidence of your usage (logs, download timestamps) to your bank to contest the dispute.</li>
        </ul>

        <h2>5. Contact Support</h2>
        <p>
          If you believe you have a valid case for a refund under Section 2, please contact us immediately:
          <br />
          <strong>Email:</strong> billing@ilovehaccp.com
        </p>
      </div>
    </div>
  );
}