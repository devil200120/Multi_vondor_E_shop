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
  
  .ql-indent-1 {
    padding-left: 2em;
  }
  
  .ql-indent-2 {
    padding-left: 4em;
  }
  
  .ql-font-serif {
    font-family: Georgia, serif;
  }
  
  .ql-font-monospace {
    font-family: Monaco, monospace;
  }
`;

const BuyerTermsOfServicePage = () => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTermsOfService = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${server}/legal-page/get-page/buyer-terms-of-service`
        );
        if (response.data.success) {
          setTermsData(response.data.page);
        }
      } catch (err) {
        console.error("Error fetching buyer terms of service:", err);
        setError(
          "Failed to load buyer terms of service. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfService();
  }, []);

  // SEO and page metadata
  useEffect(() => {
    document.title = termsData?.title || "Buyer Terms of Service";
    if (termsData?.metaDescription) {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", termsData.metaDescription);
      }
    }
  }, [termsData]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Error Loading Page
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <style>{quillContentStyles}</style>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {termsData?.title || "Buyer Terms of Service"}
              </h1>
              <div className="w-24 h-1 bg-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {termsData?.metaDescription ||
                  "These terms and conditions govern your use of our platform as a buyer. Please read them carefully."}
              </p>
              {termsData?.lastPublished && (
                <p className="text-sm text-gray-500 mt-4">
                  Last updated:{" "}
                  {new Date(termsData.lastPublished).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {termsData?.content ? (
              <div className="prose prose-lg max-w-none">
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{
                    __html: termsData.content,
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Content Coming Soon
                </h2>
                <p className="text-gray-600">
                  The buyer terms of service content is currently being updated.
                  Please check back later or contact support if you have any
                  questions.
                </p>
              </div>
            )}

            {/* Document Download */}
            {termsData?.documentFile?.cloudinary?.url && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Download Document
                </h3>
                <p className="text-blue-600 mb-3">
                  Download a copy of these terms for your records.
                </p>
                <a
                  href={termsData.documentFile.cloudinary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 mb-6">
                If you have any questions about these buyer terms of service,
                please don't hesitate to contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerTermsOfServicePage;
