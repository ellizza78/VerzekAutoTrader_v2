import api from './api';
import { Signal } from '../types';

export const signalsService = {
  async getLiveSignals(): Promise<{ ok: boolean; signals: Signal[]; count: number }> {
    const response = await api.get('/api/house-signals/live');
    return response.data;
  },

  async getSignals(params?: {
    status?: string;
    limit?: number;
  }): Promise<{ ok: boolean; signals: Signal[] }> {
    const response = await api.get('/api/signals', { params });
    return response.data;
  },

  async getSignalById(id: number): Promise<{ ok: boolean; signal: Signal }> {
    const response = await api.get(`/api/signals/${id}`);
    return response.data;
  },
};


