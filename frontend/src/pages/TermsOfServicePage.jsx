import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const TermsOfServicePage = () => {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using WANTTAR platform, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use License</h2>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily download one copy of the materials on WANTTAR's website for personal, non-commercial transitory viewing only.
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>This is the grant of a license, not a transfer of title</li>
                  <li>Under this license you may not modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Disclaimer</h2>
                <p className="text-gray-600 mb-4">
                  The materials on WANTTAR's website are provided on an 'as is' basis. WANTTAR makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Account Terms</h2>
                <p className="text-gray-600 mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>You are responsible for safeguarding the password</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Payment Terms</h2>
                <p className="text-gray-600 mb-4">
                  All payments are processed securely through our payment partners. By making a purchase, you agree to provide accurate payment information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Refund Policy</h2>
                <p className="text-gray-600 mb-4">
                  Refunds are handled on a case-by-case basis. Please contact our customer support team for refund requests.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitations</h2>
                <p className="text-gray-600 mb-4">
                  In no event shall WANTTAR or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WANTTAR's website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">Business: Manohar Enterprises</p>
                  <p className="text-gray-700">Email: support@wanttar.com</p>
                  <p className="text-gray-700">Phone: +91 7349727270</p>
                  <p className="text-gray-700">Address: 5-25 , 15th main road,3rd stage,4th block, Basaveswaranagar,near Guru sagar hotel, Bangalore 560079</p>
                </div>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
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

export default TermsOfServicePage;