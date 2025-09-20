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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Terms of Service
            </h1>

            <div className="prose max-w-none">
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  <strong>Effective Date:</strong> 20.09.2025
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  <strong>Last Updated:</strong> 20.09.2025
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Welcome to Wanttar ("Website" and "App"), operated by Wanttar.
                  By accessing or using www.wanttar.in
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  1. Use of the Platform
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>
                    You must be at least 18 years old to use our services.
                  </li>
                  <li>
                    Vendors are responsible for listing accurate product
                    details.
                  </li>
                  <li>
                    Customers are responsible for providing correct delivery and
                    payment information.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  2. Account Registration
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>
                    You agree to provide true, accurate, and complete
                    information during registration.
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  3. Multivendor Marketplace
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Wanttar is a platform connecting buyers and sellers.</li>
                  <li>
                    We are not the manufacturer of products; vendors are
                    responsible for product quality, warranty, and compliance.
                  </li>
                  <li>
                    Any disputes must be resolved between buyer and vendor,
                    though Wanttar may assist in mediation.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  4. Payments
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Payments are processed through secure gateways.</li>
                  <li>
                    Orders will only be confirmed after successful payment.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  5. Limitation of Liability
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>
                    Wanttar shall not be liable for indirect, incidental, or
                    consequential damages.
                  </li>
                  <li>
                    We do not guarantee uninterrupted access or error-free
                    operation.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  6. Governing Law
                </h2>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>These terms shall be governed by Indian law.</li>
                  <li>
                    Any disputes shall be subject to the jurisdiction of courts
                    in Bengaluru, India.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Contact Us
                </h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">Business: Manohar Enterprises</p>
                  <p className="text-gray-700">📞 +91 7349727270</p>
                  <p className="text-gray-700">📧 support@wanttar.in</p>
                  <p className="text-gray-700">
                    Address: 5-25 , 15th main road,3rd stage,4th block,
                    Basaveswaranagar,near Guru sagar hotel, Bangalore 560079
                  </p>
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

export default TermsOfServicePage;
