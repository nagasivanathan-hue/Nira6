import React from 'react';

export const metadata = {
  title: 'Refund Policy | NIRA6',
  description: 'Refund, cancellation, and return policy for NIRA6.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-heading font-bold mb-8 text-gray-900">Refund & Cancellation Policy</h1>
        
        <div className="text-gray-700 space-y-6 text-lg leading-relaxed">
          <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Product Returns (Marketplace)</h2>
            <p>For items purchased through our marketplace, returns are accepted within 7 days of delivery only if the item received is defective, damaged, or significantly not as described. To initiate a return, please contact our support team with video unboxing evidence.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Rental Cancellations</h2>
            <p>Equipment rentals can be cancelled for a full refund up to 48 hours before the rental start period. Cancellations made within 48 hours of the rental period will incur a 50% cancellation fee. No refunds will be provided for cancellations made on the day of the rental or for no-shows.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Creator Service Bookings</h2>
            <p>Bookings for creator services (e.g., photography, videography) require an advance deposit. Deposits are fully refundable if the cancellation is made at least 7 days prior to the scheduled date. If cancelled within 7 days, the deposit is non-refundable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Refund Processing Time</h2>
            <p>Approved refunds will be processed within 5-7 business days to the original method of payment. Depending on your bank or credit card provider, it may take additional time for the funds to reflect in your account.</p>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="mb-4">To request a refund or cancellation, please contact us at:</p>
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
