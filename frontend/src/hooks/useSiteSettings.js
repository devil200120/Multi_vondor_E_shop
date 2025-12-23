import { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../server";

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${server}/site-settings/get-site-settings`
        );
        
        if (response.data.success) {
          setSettings(response.data.settings);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        setError(error.message);
        // Set default settings if API fails
        setSettings({
          footerAddress: {
            streetAddress: "5-25, 15th main road, 3rd stage, 4th block, Basaveswaranagar",
            landmark: "near Guru sagar hotel",
            city: "Bangalore",
            postalCode: "560079",
            phone: "+91 7349727270",
            email: "support@wanttar.in"
          },
          companyInfo: {
            name: "Wanttar",
            description: "Your trusted online marketplace",
            website: "https://www.wanttar.in"
          },
          socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: ""
          },
          businessHours: {
            weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
            weekends: "Saturday - Sunday: 10:00 AM - 4:00 PM"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/site-settings/get-site-settings`
      );
      
      if (response.data.success) {
        setSettings(response.data.settings);
        setError(null);
      }
    } catch (error) {
      console.error("Error refreshing site settings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refreshSettings };
};