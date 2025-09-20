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
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-4">
                  At WANTTAR, we collect information to provide better services to our users. We collect information in the following ways:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and address</li>
                  <li><strong>Account Information:</strong> Username, password, and profile information</li>
                  <li><strong>Payment Information:</strong> Credit card details and billing information</li>
                  <li><strong>Usage Data:</strong> How you use our platform and services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>To provide and maintain our services</li>
                  <li>To process transactions and send order confirmations</li>
                  <li>To communicate with you about your account or orders</li>
                  <li>To improve our platform and user experience</li>
                  <li>To send promotional emails (with your consent)</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>With your explicit consent</li>
                  <li>To trusted service providers who assist us in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cookies and Tracking</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our platform:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
                <p className="text-gray-600 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Lodge a complaint with regulatory authorities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
                <p className="text-gray-600 mb-4">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Policy Updates</h2>
                <p className="text-gray-600 mb-4">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">Business: Manohar Enterprises</p>
                  <p className="text-gray-700">Email: privacy@wanttar.com</p>
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

export default PrivacyPolicyPage;