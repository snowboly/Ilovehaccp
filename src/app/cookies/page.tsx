import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | ilovehaccp.com',
  description: 'Transparency about how we use cookies and tracking technologies.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600">
        <h1 className="text-4xl font-extrabold mb-4">Cookie Policy</h1>
        <p className="lead text-lg">
          We believe in being transparent about how we use your data. This policy explains the cookies we use and why.
        </p>

        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help us remember your login state, your progress in the HACCP wizard, and your language preferences.
        </p>

        <h2>2. Types of Cookies We Use</h2>
        
        <h3>Strictly Essential Cookies (Required)</h3>
        <p>These are necessary for the website to function. You cannot switch these off.</p>
        <ul>
          <li><strong>Auth Token:</strong> Keeps you logged in securely.</li>
          <li><strong>Wizard State:</strong> Remembers your answers if you refresh the page while building a plan.</li>
          <li><strong>CSRF Token:</strong> Protects against security attacks.</li>
        </ul>

        <h3>Performance & Analytics (Optional)</h3>
        <p>
          These help us understand how users interact with our site (e.g., which articles are most popular). We use anonymized data that does not identify you personally.
        </p>

        <h2>3. Managing Your Preferences</h2>
        <p>
          You can change your cookie preferences at any time by clicking the "Cookie Settings" link in the footer or by adjusting your browser settings.
        </p>

        <h2>4. Updates to This Policy</h2>
        <p>
          We may update this policy to reflect changes in technology or legislation. Please check back periodically.
        </p>

        <div className="mt-8 pt-8 border-t">
          <Link href="/privacy" className="text-blue-600 font-bold hover:underline">
            ← Back to Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}