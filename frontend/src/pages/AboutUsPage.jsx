import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useLegalPage } from "../hooks/useLegalPage";
import { useSiteSettings } from "../hooks/useSiteSettings";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineHeart,
  HiOutlineGlobe,
  HiOutlineGift,
} from "react-icons/hi";
import { AiOutlineRocket, AiOutlineAim, AiOutlineEye } from "react-icons/ai";

const AboutUsPage = () => {
  const { legalPage, loading, error } = useLegalPage("about-us");
  const { settings: siteSettings } = useSiteSettings();

  // Get contact info from site settings
  const contactInfo = {
    address: siteSettings?.footerAddress?.streetAddress 
      ? `${siteSettings.footerAddress.streetAddress}, ${siteSettings.footerAddress.city} ${siteSettings.footerAddress.postalCode}`
      : "Contact address not set",
    phone: siteSettings?.footerAddress?.phone || "Phone not set",
    email: siteSettings?.footerAddress?.email || "Email not set",
  };
  
  const companyName = siteSettings?.companyInfo?.name || siteSettings?.branding?.siteTitle || "Our Company";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading spinner while fetching legal page content
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading About Us content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If admin has created custom About Us content, show it
  if (legalPage && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Dynamic Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {legalPage.title}
            </h1>
            {legalPage.metaDescription && (
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                {legalPage.metaDescription}
              </p>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Explore Products
              </Link>
              <Link
                to="/shop-create"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dynamic Content Section */}
          <section className="py-20">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: legalPage.content,
                }}
                style={{
                  lineHeight: "1.6",
                  color: "#374151",
                }}
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get in Touch
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Our team is here to
                help.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineLocationMarker className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                  <p className="text-blue-100 text-center">
                    {contactInfo.address}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <HiOutlinePhone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                  <p className="text-blue-100">{contactInfo.phone}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineMail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-blue-100">{contactInfo.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/faq"
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300"
                >
                  View FAQ
                </Link>
                <Link
                  to="/inbox"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    );
  }

  // Fallback to static content if no admin content is available or there's an error
  const teamMembers = [
    {
      name: "Subhankar Dash",
      role: "Founder & CEO",
      image: "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=SD",
      description:
        "Visionary leader with 10+ years in e-commerce and technology innovation.",
    },
    {
      name: "Tech Team",
      role: "Development Team",
      image: "https://via.placeholder.com/300x300/059669/FFFFFF?text=DEV",
      description: "Expert developers creating seamless shopping experiences.",
    },
    {
      name: "Support Team",
      role: "Customer Success",
      image: "https://via.placeholder.com/300x300/DC2626/FFFFFF?text=SUP",
      description:
        "Dedicated support team ensuring customer satisfaction 24/7.",
    },
  ];

  const values = [
    {
      icon: HiOutlineHeart,
      title: "Customer First",
      description:
        "Every decision we make puts our customers at the center. Your satisfaction is our success.",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Trust & Security",
      description:
        "We prioritize the security of your data and transactions with industry-leading protection.",
    },
    {
      icon: AiOutlineRocket,
      title: "Innovation",
      description:
        "Constantly evolving with cutting-edge technology to enhance your shopping experience.",
    },
    {
      icon: HiOutlineGlobe,
      title: "Global Reach",
      description:
        "Connecting buyers and sellers worldwide, breaking down geographical barriers.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers", icon: HiOutlineUsers },
    { number: "500+", label: "Trusted Sellers", icon: HiOutlineShoppingBag },
    { number: "50K+", label: "Products", icon: HiOutlineGift },
    { number: "99.9%", label: "Uptime", icon: HiOutlineTruck },
  ];

  // Render fallback static content
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Error Message if there was an issue loading admin content */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Unable to load custom About Us content. Showing default content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            About {companyName}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {siteSettings?.companyInfo?.description || "Your premier destination for quality products from trusted sellers worldwide. We're revolutionizing e-commerce with innovation, trust, and exceptional service."}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Explore Products
            </Link>
            <Link
              to="/shop-create"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Our Story Section */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded with a vision to democratize e-commerce, {companyName} began
                  as a simple idea: create a platform where quality meets
                  affordability, and where every seller, regardless of size, can
                  reach customers worldwide.
                </p>
                <p>
                  What started as a small project has evolved into a thriving
                  marketplace that connects thousands of buyers with hundreds of
                  trusted sellers. We believe in the power of technology to
                  break down barriers and create opportunities for businesses of
                  all sizes.
                </p>
                <p>
                  Today, {companyName} stands as a testament to innovation,
                  reliability, and customer-centricity. Every feature we build,
                  every partnership we forge, and every customer interaction we
                  have is guided by our commitment to excellence.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                <img
                  src="https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Our+Journey"
                  alt="Our Journey"
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-xl shadow-md">
                    <div className="text-2xl font-bold text-blue-600">2023</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-md">
                    <div className="text-2xl font-bold text-purple-600">
                      India
                    </div>
                    <div className="text-sm text-gray-600">Headquarters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-white rounded-2xl shadow-lg mb-20">
          <div className="px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AiOutlineAim className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower businesses and individuals by providing a seamless,
                  secure, and innovative e-commerce platform that connects
                  quality products with customers worldwide, fostering growth
                  and success for all.
                </p>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AiOutlineEye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To become the world's most trusted and innovative multi-vendor
                  marketplace, where technology meets human connection, creating
                  exceptional value for buyers, sellers, and communities
                  globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Growing Together
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our success is measured by the success of our community
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate people behind {companyName}'s success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 shadow-lg"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Our team is here to
              help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineLocationMarker className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                <p className="text-blue-100 text-center">
                  {contactInfo.address}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <HiOutlinePhone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                <p className="text-blue-100">{contactInfo.phone}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineMail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-blue-100">{contactInfo.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/faq"
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                View FAQ
              </Link>
              <Link
                to="/inbox"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
