import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const PrivacyPolicyPage = () => {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose max-w-none">
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2"><strong>Effective Date:</strong> 20.09.2025</p>
                <p className="text-lg text-gray-700 mb-6"><strong>Last Updated:</strong> 20.09.2025</p>
                <p className="text-lg text-gray-700 mb-6">
                  Wanttar values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Personal details (name, email, phone, address).</li>
                  <li>Payment information (processed securely via third-party gateways).</li>
                  <li>Browsing & usage data (cookies, IP address, device info).</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Information</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>To process orders and payments.</li>
                  <li>To provide customer support.</li>
                  <li>To improve user experience and marketing.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Sharing of Information</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>With vendors for order fulfillment.</li>
                  <li>With payment gateways for transactions.</li>
                  <li>With logistics partners for delivery.</li>
                  <li>We do not sell or rent personal data to third parties.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Industry-standard encryption and secure servers are used.</li>
                  <li>Users are responsible for safeguarding their login credentials.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>You may request access, correction, or deletion of your personal data.</li>
                  <li>You may opt out of marketing communications anytime.</li>
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

export default PrivacyPolicyPage;