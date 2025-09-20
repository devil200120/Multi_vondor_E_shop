import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const ShippingPolicyPage = () => {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping & Delivery Policy</h1>
            
            <div className="prose max-w-none">
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-6"><strong>Effective Date:</strong> 20.09.2025</p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Shipping Time</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Orders are processed within 1-3 business days.</li>
                  <li>Delivery time depends on the vendor's location & courier partner (generally 5-10 business days).</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Shipping Charges</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Charges (if any) will be displayed at checkout.</li>
                  <li>Free shipping may be offered on select products.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Tracking</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Customers will receive tracking details via email/SMS.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Delays</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Wanttar is not responsible for courier delays due to natural disasters, strikes, or unforeseen issues.</li>
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

export default ShippingPolicyPage;