import api, { tokenManager } from './api';
import { User, LoginResponse, RegisterResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', { email, password });
    
    if (response.data.ok) {
      await tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    }
    
    return response.data;
  },

  async register(
    email: string,
    password: string,
    fullName: string,
    referralCode?: string
  ): Promise<RegisterResponse> {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
        referral_code: referralCode || undefined,
      });
      
      if (response.data.ok) {
        await tokenManager.setTokens(
          response.data.access_token || response.data.token,
          response.data.refresh_token
        );
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error.response?.data || error.message);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await tokenManager.clearTokens();
  },

  async getCurrentUser(): Promise<{ ok: boolean; user?: User; error?: string }> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async verifyEmail(token: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  },

  async resendVerification(email: string): Promise<{ ok: boolean; message?: string }> {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ ok: boolean; message?: string }> {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> {
    const response = await api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await tokenManager.getAccessToken();
    return !!token;
  },
};


