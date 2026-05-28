import React from 'react';

export const metadata = {
  title: 'Cookie Policy | NIRA6',
  description: 'How NIRA6 uses cookies and tracking technologies.',
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-heading font-bold mb-8 text-gray-900">Cookie Policy</h1>
        
        <div className="text-gray-700 space-y-6 text-lg leading-relaxed">
          <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. What Are Cookies</h2>
            <p>Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us understand how you use our site, remember your preferences, and improve your overall experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., keeping you logged in, saving items to your cart).</li>
              <li><strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our website.</li>
              <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website and personalize our content for you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Managing Cookies</h2>
            <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you.</p>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="mb-4">If you have any questions about our use of cookies, please contact us at:</p>
            <address className="not-italic text-gray-600 bg-gray-50 p-6 rounded-xl">
              <strong>NIRA6</strong><br />
              1/32 A-7 TPK<br />
              MDU-5 (Madurai)<br />
              Tamil Nadu, India<br />
              Email: nira6studio@gmail.com
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
