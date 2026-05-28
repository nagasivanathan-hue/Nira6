import React from 'react';

export const metadata = {
  title: 'Privacy Policy | NIRA6',
  description: 'How we collect, use, and protect your data at NIRA6.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-heading font-bold mb-8 text-gray-900">Privacy Policy</h1>
        
        <div className="text-gray-700 space-y-6 text-lg leading-relaxed">
          <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including your name, email address, phone number, shipping address, and payment information when you create an account, make a purchase, or rent equipment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send related information including confirmations and receipts, and provide customer support.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Sharing and Security</h2>
            <p>We do not sell your personal information. We may share your information with third-party service providers (such as payment processors and shipping partners) strictly for the purpose of fulfilling your requests. We implement reasonable security measures to protect your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly.</p>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="mb-4">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
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
