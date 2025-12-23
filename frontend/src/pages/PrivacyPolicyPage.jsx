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
  
  /* Enhanced styles for Word document content */
  .document-content {
    color: #333;
    max-width: none;
  }
  
  .document-content h1,
  .document-content h2,
  .document-content h3,
  .document-content h4,
  .document-content h5,
  .document-content h6 {
    color: #2c3e50;
    font-weight: bold;
  }
  
  .document-content p {
    margin-bottom: 1em;
    line-height: 1.7;
  }
  
  .document-content ul,
  .document-content ol {
    margin: 1em 0;
    padding-left: 2em;
  }
  
  .document-content li {
    margin-bottom: 0.5em;
    line-height: 1.6;
  }
  
  .document-content blockquote {
    border-left: 4px solid #3498db;
    padding-left: 1.5em;
    margin: 1.5em 0;
    font-style: italic;
    background-color: #f8f9fa;
    padding: 1em 1.5em;
  }
  
  .document-content strong {
    font-weight: bold;
  }
  
  .document-content em {
    font-style: italic;
  }
  
  .document-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }
  
  .document-content th,
  .document-content td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  
  .document-content th {
    background-color: #f2f2f2;
    font-weight: bold;
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

const PrivacyPolicyPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await axios.get(
          `${server}/legal-page/get-page/privacy-policy`
        );
        if (response.data.success) {
          setPageData(response.data.page);
        } else {
          setError("Page not found");
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setError("Failed to load page content");
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  const defaultContent = {
    title: "Privacy Policy",
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
            Wanttar values your privacy. This Privacy Policy explains how
            we collect, use, and protect your personal information.
          </p>
        </div>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            1. Information We Collect
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Personal details (name, email, phone, address).</li>
            <li style="margin-bottom: 8px;">
              Payment information (processed securely via third-party gateways).
            </li>
            <li style="margin-bottom: 8px;">
              Browsing & usage data (cookies, IP address, device info).
            </li>
          </ul>
        </section>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            2. How We Use Information
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">To process orders and payments.</li>
            <li style="margin-bottom: 8px;">To provide customer support.</li>
            <li style="margin-bottom: 8px;">To improve user experience and marketing.</li>
          </ul>
        </section>

        <section style="margin-bottom: 32px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
            3. Sharing of Information
          </h2>
          <ul style="list-style-type: disc; margin-left: 20px; color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">With vendors for order fulfillment.</li>
            <li style="margin-bottom: 8px;">With payment gateways for transactions.</li>
            <li style="margin-bottom: 8px;">With logistics partners for delivery.</li>
            <li style="margin-bottom: 8px;">
              We do not sell or rent personal data to third parties.
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
      "Privacy Policy for Wanttar - Multi-vendor E-commerce Platform",
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

export default PrivacyPolicyPage;
