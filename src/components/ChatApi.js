import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

const ChatApi = {
  async fetchMessages(sessionId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chat/${sessionId}/messages/`,
        {
          headers: getAuthHeaders(),
          timeout: 10000,
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status >= 400) {
        return {
          success: false,
          error: response.data?.detail || 'Failed to fetch messages',
          status: response.status
        };
      }

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          error: 'Network error - please check your connection',
          status: null
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch messages',
        status: error.response?.status
      };
    }
  },

  async sendMessage(sessionId, formData) {
    try {
      console.log('Sending message with formData:', formData);
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${sessionId}/messages/`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          timeout: 50000,
          withCredentials: true
        }
      );

      console.log('Server response:', response.data);
      if (response.status >= 400) {
        return {
          success: false,
          error: response.data?.detail || response.data?.message || 'Message submission failed',
          status: response.status,
          data: response.data
        };
      }

      // Modified to handle multiple attachments
      const responseData = {
        ...response.data,
        attachments: response.data.attachments ? 
          response.data.attachments.map(att => ({
            url: att.url ? `${API_BASE_URL}${att.url}` : null,
            type: att.attachment_type,
            name: att.name || 'file'
          })) : []
      };

      return {
        success: true,
        data: responseData,
        status: response.status
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
        status: error.response?.status
      };
    }
  },

  async checkServerHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health/`, {
        timeout: 3000
      });
      return {
        success: true,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.status === 404
          ? 'Health endpoint not found'
          : 'Server unavailable',
        status: error.response?.status
      };
    }
  },

  // New call-related methods
  async initiateCall(sessionId, callType) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${sessionId}/calls/`,
        { call_type: callType },
        {
          headers: getAuthHeaders(),
          timeout: 10000,
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status >= 400) {
        return {
          success: false,
          error: response.data?.detail || 'Failed to initiate call',
          status: response.status
        };
      }

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to initiate call',
        status: error.response?.status
      };
    }
  },

  async endCall(sessionId, callId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${sessionId}/calls/${callId}/end/`,
        {},
        {
          headers: getAuthHeaders(),
          timeout: 10000,
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status >= 400) {
        return {
          success: false,
          error: response.data?.detail || 'Failed to end call',
          status: response.status
        };
      }

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to end call',
        status: error.response?.status
      };
    }
  },

  async getIceServers() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/webrtc/ice-servers/`,
        {
          headers: getAuthHeaders(),
          timeout: 5000
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get ICE servers',
        status: error.response?.status
      };
    }
  },

  async sendIceCandidate(sessionId, candidate) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${sessionId}/ice-candidate/`,
        { candidate },
        {
          headers: getAuthHeaders(),
          timeout: 5000
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send ICE candidate',
        status: error.response?.status
      };
    }
  },

  async answerCall(sessionId, callId, sdp) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${sessionId}/calls/${callId}/answer/`,
        { sdp },
        {
          headers: getAuthHeaders(),
          timeout: 10000
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to answer call',
        status: error.response?.status
      };
    }
  }
};

export default ChatApi;