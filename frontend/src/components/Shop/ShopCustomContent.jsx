import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";

const ShopCustomContent = ({ shopId }) => {
  const [customHtml, setCustomHtml] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customHtmlEnabled, setCustomHtmlEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomContent = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${server}/shop/get-shop-custom-html/${shopId}`
        );
        setCustomHtml(data.customHtml || "");
        setCustomCss(data.customCss || "");
        setCustomHtmlEnabled(data.customHtmlEnabled || false);
      } catch (error) {
        console.error("Error fetching custom content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomContent();
  }, [shopId]);

  // Don't render anything if custom content is not enabled or empty
  if (loading || !customHtmlEnabled || (!customHtml && !customCss)) {
    return null;
  }

  return (
    <div className="shop-custom-content mb-8">
      {/* Inject custom CSS */}
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}

      {/* Render custom HTML */}
      {customHtml && (
        <div
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: customHtml }}
        />
      )}
    </div>
  );
};

export default ShopCustomContent;
