import React, { useState, useEffect } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import axios from "axios";
import { server } from "../server";
import Loader from "../components/Layout/Loader";
import "react-quill/dist/quill.snow.css"; // Import Quill styles for proper formatting

// Quill content styles for displaying formatted content
const quillContentStyles = `
  .ql-editor {
    padding: 0;
    border: none;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .ql-size-small {
    font-size: 12px;
  }
  
  .ql-size-large {
    font-size: 20px;
  }
  
  .ql-size-huge {
    font-size: 28px;
  }
  
  .ql-align-center {
    text-align: center;
  }
  
  .ql-align-right {
    text-align: right;
  }
  
  .ql-align-justify {
    text-align: justify;
  }
  
  .ql-direction-rtl {
    direction: rtl;
  }
`;

// Inject styles if not already present
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = quillContentStyles;
  if (!document.head.querySelector("style[data-quill-content]")) {
    styleElement.setAttribute("data-quill-content", "true");
    document.head.appendChild(styleElement);
  }
}

const TermsOfServicePage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await axios.get(
          `${server}/legal-page/get-page/terms-of-service`
        );
        if (response.data.success) {
          setPageData(response.data.page);
        } else {
          setError("Page not found");
        }
      } catch (err) {
        console.error("Error fetching terms of service:", err);
        setError("Failed to load page content");
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  const defaultContent = {
    title: "Terms of Service",
    content: `
      <div>
        <div style="margin-bottom: 24px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 8px;">
            <strong>Effective Date:</strong> 20.09.2025
          </p>
          <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
            <strong>Last Updated:</strong> 20.09.2025
          </p>
          <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
            Welcome to Wanttar ("Website" and "App"), operated by Wanttar.
            By accessing or using www.wanttar.in
          </p>
        </div>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            1. Use of the Platform
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">
              You must be at least 18 years old to use our services.
            </li>
            <li style="margin-bottom: 8px;">
              Vendors are responsible for listing accurate product details.
            </li>
            <li style="margin-bottom: 8px;">
              Customers are responsible for providing correct delivery and payment information.
            </li>
          </ul>
        </section>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            2. Account Registration
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">
              You agree to provide true, accurate, and complete information during registration.
            </li>
            <li style="margin-bottom: 8px;">
              You are responsible for maintaining the confidentiality of your account.
            </li>
          </ul>
        </section>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            3. Multivendor Marketplace
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Wanttar is a platform connecting buyers and sellers.</li>
            <li style="margin-bottom: 8px;">
              We are not the manufacturer of products; vendors are responsible for product quality, warranty, and compliance.
            </li>
            <li style="margin-bottom: 8px;">
              Any disputes must be resolved between buyer and vendor, though Wanttar may assist in mediation.
            </li>
          </ul>
        </section>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            Contact Us
          </h2>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px;">
            <p style="color: #374151;">Business: Manohar Enterprises</p>
            <p style="color: #374151;">📞 +91 7349727270</p>
            <p style="color: #374151;">📧 support@wanttar.in</p>
            <p style="color: #374151;">
              Address: 5-25 , 15th main road,3rd stage,4th block,
              Basaveswaranagar,near Guru sagar hotel, Bangalore 560079
            </p>
          </div>
        </section>
      </div>
    `,
    metaDescription:
      "Terms of Service for Wanttar - Multi-vendor E-commerce Platform",
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  const contentToDisplay = pageData || defaultContent;

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {contentToDisplay.title}
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-yellow-700">
                  {error}. Showing default content.
                </p>
              </div>
            )}

            <div className="prose max-w-none document-content">
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: contentToDisplay.content }}
              />
            </div>

            {pageData && (
              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(pageData.updatedAt).toLocaleDateString()}
                  {pageData.version && ` • Version ${pageData.version}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
