import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const RefundPolicyPage = () => {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Return & Refund Policy</h1>
            
            <div className="prose max-w-none">
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-6"><strong>Effective Date:</strong> 20.09.2025</p>
                <p className="text-lg text-gray-700 mb-6">
                  At Wanttar, customer satisfaction is important.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Return Policy</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Products can be returned within 7 days of delivery if they are defective, damaged, or incorrect.</li>
                  <li>Items must be unused, in original packaging, with tags/invoice.</li>
                  <li>Certain items (perishables, personal care, customized products) are non-returnable.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Refund Policy</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Refunds will be processed after product inspection.</li>
                  <li>Refund will be initiated to the original payment method within 7-10 business days.</li>
                  <li>In case of COD orders, refund will be made via bank transfer/UPI.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Exchange Policy</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Exchanges are subject to availability.</li>
                  <li>If not available, a refund will be provided.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">Business: Manohar Enterprises</p>
                  <p className="text-gray-700">📞 +91 7349727270</p>
                  <p className="text-gray-700">📧 support@wanttar.in</p>
                  <p className="text-gray-700">Address: 5-25 , 15th main road,3rd stage,4th block, Basaveswaranagar,near Guru sagar hotel, Bangalore 560079</p>
                </div>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  Last updated: 20.09.2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicyPage;