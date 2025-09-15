const express = require("express");
const axios = require("axios");
const router = express.Router();

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyBRlJfWUcvOqx0ecIu29D6tsUjybfQG6OA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// AI Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Prepare the request to Gemini API
    const geminiRequest = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful AI assistant for a multi-vendor e-commerce platform called "Multi Vendor E-Shop". You can help users with:
              - Product recommendations and shopping guidance
              - Order information and tracking
              - General e-commerce queries and platform navigation
              - Account and seller information
              - Shipping and delivery questions
              - Payment and checkout assistance
              
              Always be helpful, friendly, and provide concise but informative responses. Keep your answers relevant to e-commerce and shopping.
              
              User's question: ${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    // Make request to Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      geminiRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    // Extract the response text
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      res.status(200).json({
        success: true,
        message: aiResponse
      });
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    
    let errorMessage = "I'm sorry, I'm having trouble responding right now. Please try again later.";
    
    if (error.response?.status === 429) {
      errorMessage = "I'm experiencing high traffic right now. Please try again in a moment.";
    } else if (error.response?.status === 403) {
      errorMessage = "I'm currently unavailable due to API restrictions. Please check back later.";
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Response timeout. Please try asking a shorter question.";
    }

    res.status(200).json({
      success: true,
      message: errorMessage
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Chat service is running"
  });
});

module.exports = router;