import React from 'react';

export const metadata = {
  title: 'Terms of Service | NIRA6',
  description: 'Terms and conditions for using the NIRA6 platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-heading font-bold mb-8 text-gray-900">Terms of Service</h1>
        
        <div className="text-gray-700 space-y-6 text-lg leading-relaxed">
          <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p>By accessing or using the NIRA6 platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Services Offered</h2>
            <p>NIRA6 operates an online marketplace and rental platform for camera equipment, electronics, and creative services. We facilitate transactions between buyers, sellers, renters, and creators.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p>To use certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Transactions & Payments</h2>
            <p>All payments made through NIRA6 are securely processed. We reserve the right to refuse or cancel any order if fraud or an unauthorized or illegal transaction is suspected.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Information</h2>
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
