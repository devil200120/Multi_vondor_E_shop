import axios from 'axios';
import { backend_url } from '../server';

class GeminiService {
  constructor() {
    // Remove /api/v2 from backend_url since we'll add the full path
    this.baseURL = `${backend_url.replace('/api/v2', '')}api/v2/ai-chat`;
  }

  async generateResponse(message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 35000 // 35 seconds timeout (longer than backend)
        }
      );

      if (response.data?.success && response.data?.message) {
        return response.data.message;
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      if (error.code === 'ECONNABORTED') {
        return "I'm taking longer than usual to respond. Please try asking a shorter question.";
      } else if (error.response?.status === 500) {
        return "I'm experiencing technical difficulties. Please try again in a moment.";
      } else if (error.response?.status === 429) {
        return "I'm experiencing high traffic right now. Please try again in a moment.";
      } else if (!navigator.onLine) {
        return "It seems you're offline. Please check your internet connection and try again.";
      } else {
        return "I'm sorry, I'm having trouble responding right now. Please try again later.";
      }
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;