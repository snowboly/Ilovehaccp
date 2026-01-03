export const metadata = {
  title: 'Privacy Policy | ilovehaccp.com',
  description: 'Our commitment to data protection, GDPR compliance, and business confidentiality.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600">
        <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-8 border-b pb-8">
          <span>Effective Date: December 30, 2025</span>
          <span>•</span>
          <span>Version 2.0</span>
        </div>

        <p className="lead text-lg">
          At <strong>ilovehaccp.com</strong> ("we", "our", or "us"), we understand that your food safety data is sensitive business intelligence. 
          This policy outlines how we handle the operational details you input to generate your plans, as well as your personal account information.
        </p>

        <h2>1. Data We Collect</h2>
        <h3>1.1. Account Information</h3>
        <p>When you register, we collect your name, email address, and encrypted password. If you purchase a paid plan, our payment processor (Stripe) collects billing details; we do not store full credit card numbers.</p>

        <h3>1.2. HACCP Operational Data (Your Intellectual Property)</h3>
        <p>To generate your plan, our Wizard collects detailed information about your:</p>
        <ul>
          <li>Recipes and Ingredients</li>
          <li>Process Flows and Equipment</li>
          <li>Supplier Details</li>
          <li>Staff Training Records</li>
        </ul>
        <p>
          <strong>Crucially:</strong> We treat this as your proprietary business information. We do not sell, rent, or share your specific operational data with third-party advertisers. 
          It is processed solely to generate your documents.
        </p>

        <h2>2. How We Use AI (Artificial Intelligence)</h2>
        <p>
          Our service utilizes Large Language Models (LLMs) to analyze your inputs and draft your HACCP plan.
        </p>
        <ul>
          <li><strong>Processing:</strong> Your inputs are sent to our AI providers (e.g., Groq, OpenAI) via secure, encrypted APIs for the sole purpose of generation.</li>
          <li><strong>Zero Training Policy:</strong> We strictly do <strong>NOT</strong> use your specific proprietary recipes, process flows, or ingredient lists to train, fine-tune, or improve our foundational AI models. Your business intelligence remains isolated and is not shared with other users.</li>
        </ul>

        <h2>3. Data Retention & Security</h2>
        <p>
          We employ enterprise-grade security including encryption at rest (AES-256) and in transit (TLS 1.3). 
          Your generated HACCP plans are stored in your secure dashboard until you delete them. You may export and delete your data at any time.
        </p>

        <h2>4. Your Rights (GDPR & CCPA)</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
          <li><strong>Rectification:</strong> Fix errors in your plans or profile.</li>
          <li><strong>Erasure:</strong> Request total deletion of your account and all associated HACCP documents ("Right to be Forgotten").</li>
          <li><strong>Portability:</strong> Download your plans in standard formats (PDF, JSON).</li>
        </ul>

        <h2>5. Cookies & Tracking</h2>
        <p>
          We use essential cookies to keep you logged in. For analytics, we use anonymized tools that do not track individual user behavior across the web. 
          Please see our <a href="/cookies">Cookie Policy</a> for details.
        </p>

        <h2>6. Contact & DPO</h2>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-slate-700"><strong>Email:</strong> support@ilovehaccp.com</p>
            <p className="text-slate-700"><strong>Address:</strong> Digital Services Division, ilovehaccp.com</p>
          </div>
      </div>
    </div>
  );
}