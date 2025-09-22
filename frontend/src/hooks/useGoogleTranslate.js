import { useEffect, useCallback } from 'react';

export const useGoogleTranslate = () => {
  // Clean up Google elements
  const cleanupGoogleElements = useCallback(() => {
    const elementsToHide = [
      ".goog-te-banner-frame",
      ".goog-te-ftab", 
      "#goog-gt-tt",
      ".goog-te-balloon-frame",
      ".goog-te-spinner",
      ".goog-te-menu-frame",
      ".skiptranslate",
      'iframe[src*="translate.googleapis.com"]',
    ];

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = "none !important";
        element.style.visibility = "hidden !important";
        element.style.opacity = "0 !important";
      });
    });

    if (document.body.style.top) {
      document.body.style.top = "";
    }
    if (document.body.style.position === "relative") {
      document.body.style.position = "";
    }

    const googleElement = document.querySelector("#google_translate_element");
    if (googleElement) {
      googleElement.style.display = "none !important";
    }
  }, []);

  // Initialize Google Translate globally
  const initializeGoogleTranslate = useCallback(() => {
    // Prevent multiple initializations
    if (window.googleTranslateInitialized) {
      return;
    }

    if (window.google?.translate || document.querySelector('script[src*="translate.google.com"]')) {
      window.googleTranslateInitialized = true;
      cleanupGoogleElements();
      return;
    }

    window.googleTranslateElementInit = () => {
      try {
        // Create hidden container if it doesn't exist
        let container = document.querySelector("#google_translate_element");
        if (!container) {
          container = document.createElement("div");
          container.id = "google_translate_element";
          container.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute; left: -9999px; top: -9999px;";
          document.body.appendChild(container);
        }

        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,te,bn,ta,gu,kn,ml,pa,or,as",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );

        window.googleTranslateInitialized = true;
        
        setTimeout(() => {
          cleanupGoogleElements();
          const cleanupInterval = setInterval(cleanupGoogleElements, 2000);
          setTimeout(() => clearInterval(cleanupInterval), 30000);
        }, 1000);

        console.log("Google Translate initialized globally");
      } catch (error) {
        console.error("Google Translate initialization failed:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      console.error("Failed to load Google Translate script");
    };

    document.head.appendChild(script);
  }, [cleanupGoogleElements]);

  // Change language function that works globally
  const changeLanguage = useCallback((langCode) => {
    try {
      console.log(`Changing language to: ${langCode}`);
      
      // Save language preference immediately
      localStorage.setItem("googleTranslate_lang", langCode);
      
      // Mark that language change is in progress
      sessionStorage.setItem('languageChangeInProgress', 'true');
      
      // Get domain for cookie setting
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      console.log(`Domain info - hostname: ${hostname}, isLocalhost: ${isLocalhost}`);
      
      // Clear any existing Google Translate cookies first
      const cookieNames = ['googtrans', 'googtrans-temp'];
      cookieNames.forEach(cookieName => {
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        if (!isLocalhost) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${hostname};`;
        }
      });

      if (langCode === "en") {
        console.log("Setting to English - clearing Google Translate cookies");
        // For English, we just cleared the cookies above
      } else {
        // Set Google Translate cookie for other languages
        const googTransValue = `/en/${langCode}`;
        console.log(`Setting Google Translate cookie: ${googTransValue}`);
        
        // Set cookie for different domain scenarios
        document.cookie = `googtrans=${googTransValue}; path=/; max-age=31536000;`;
        if (!isLocalhost) {
          document.cookie = `googtrans=${googTransValue}; path=/; domain=${hostname}; max-age=31536000;`;
          try {
            document.cookie = `googtrans=${googTransValue}; path=/; domain=.${hostname}; max-age=31536000;`;
          } catch (e) {
            console.log("Could not set subdomain cookie:", e);
          }
        }
      }
      
      // Verify cookie was set correctly
      setTimeout(() => {
        const cookies = document.cookie.split(";");
        const googTransCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("googtrans=")
        );
        console.log("Cookie verification - all cookies:", document.cookie);
        console.log("Google Translate cookie:", googTransCookie ? googTransCookie.trim() : "Not found");
      }, 100);

      // Force a longer wait to ensure cookie is set
      const loadingMessage = document.createElement('div');
      loadingMessage.id = 'language-change-loader';
      loadingMessage.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          font-family: Arial, sans-serif;
        ">
          <div style="
            background: white;
            padding: 30px 40px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          ">
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 10px;
            ">🌍 Changing language...</div>
            <div style="
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            ">Please wait a moment</div>
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #f3f3f3;
              border-top: 3px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            "></div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        </div>
      `;
      document.body.appendChild(loadingMessage);

      // Wait longer in deployment environments
      const reloadDelay = isLocalhost ? 1500 : 2500;
      
      setTimeout(() => {
        console.log("Reloading page to apply language change");
        
        // Try multiple reload approaches for better compatibility
        try {
          // Method 1: Force reload with cache bypass
          window.location.reload(true);
        } catch (e1) {
          try {
            // Method 2: Navigate to same URL with timestamp
            const url = new URL(window.location);
            url.searchParams.set('lang', langCode);
            url.searchParams.set('t', Date.now());
            window.location.href = url.toString();
          } catch (e2) {
            // Method 3: Simple reload
            window.location.reload();
          }
        }
      }, reloadDelay);

    } catch (error) {
      console.error("Language change failed:", error);
      // Fallback: Always reload on error, but with delay
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }
  }, []);

  // Get current language
  const getCurrentLanguage = useCallback(() => {
    try {
      // First check localStorage for immediate availability
      const savedLang = localStorage.getItem("googleTranslate_lang");
      
      // Then check Google Translate cookie
      const cookies = document.cookie.split(";");
      const googTransCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("googtrans=")
      );

      if (googTransCookie) {
        const value = googTransCookie.split("=")[1];
        if (value && value.includes("/")) {
          const langCode = value.split("/")[2] || "en";
          console.log(`Language from cookie: ${langCode}`);
          
          // Update localStorage to match cookie
          if (savedLang !== langCode) {
            localStorage.setItem("googleTranslate_lang", langCode);
          }
          
          return langCode;
        }
      }
      
      // Fallback to localStorage or default
      const fallbackLang = savedLang || "en";
      console.log(`Language from localStorage/default: ${fallbackLang}`);
      return fallbackLang;
      
    } catch (error) {
      console.error("Error getting current language:", error);
      return "en";
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeGoogleTranslate();

    // Set up mutation observer for cleanup
    const observer = new MutationObserver(() => {
      cleanupGoogleElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Periodic cleanup
    const cleanupInterval = setInterval(cleanupGoogleElements, 3000);

    return () => {
      observer.disconnect();
      clearInterval(cleanupInterval);
    };
  }, [initializeGoogleTranslate, cleanupGoogleElements]);

  return {
    changeLanguage,
    getCurrentLanguage,
  };
};