import React, { useState, useEffect, useRef } from "react";
import { useGoogleTranslate } from "../../hooks/useGoogleTranslate";
import { HiTranslate, HiChevronDown } from "react-icons/hi";

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { changeLanguage, getCurrentLanguage } = useGoogleTranslate();

  // Language data with flags and names
  const languages = [
    { code: "en", name: "English", native: "English", flag: "🇺🇸" },
    { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
    { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
    { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    { code: "as", name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  ];

  // Get current language on mount
  useEffect(() => {
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, [getCurrentLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);
    changeLanguage(langCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  return (
    <div className="google-translate-container" ref={dropdownRef}>
      <div className="custom-translate-selector">
        <button
          className={`translate-trigger ${isLoading ? "disabled" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <div className="translate-info">
            <HiTranslate className="globe-icon" size={16} />
            <span className="translate-label">Language</span>
          </div>
          <div className="current-lang">
            <span className="flag">{currentLanguage.flag}</span>
            <span className="lang-name">{currentLanguage.native}</span>
          </div>
          <HiChevronDown
            className={`chevron ${isOpen ? "rotated" : ""} ${
              isLoading ? "spinning" : ""
            }`}
            size={14}
          />
        </button>

        {isOpen && (
          <div className="translate-dropdown">
            <div className="dropdown-header">
              <HiTranslate size={16} />
              <span>Select Language</span>
            </div>
            <div className="language-list">
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`language-option ${
                    currentLang === language.code ? "active" : ""
                  }`}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isLoading}
                >
                  <span className="flag">{language.flag}</span>
                  <div className="lang-details">
                    <div className="native-name">{language.native}</div>
                    <div className="english-name">{language.name}</div>
                  </div>
                  {currentLang === language.code && (
                    <span className="checkmark">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="dropdown-footer">
              <small>Powered by Google Translate</small>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="translate-loading">
          <div className="loading-spinner"></div>
          <span>Changing language...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
