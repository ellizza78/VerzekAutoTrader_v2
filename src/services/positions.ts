import api from './api';
import { Position } from '../types';

export const positionsService = {
  async getPositions(params?: {
    status?: string;
    limit?: number;
  }): Promise<{ ok: boolean; positions: Position[] }> {
    const response = await api.get('/api/positions', { params });
    return response.data;
  },

  async getOpenPositions(): Promise<{ ok: boolean; positions: Position[] }> {
    return this.getPositions({ status: 'OPEN' });
  },

  async getClosedPositions(limit = 50): Promise<{ ok: boolean; positions: Position[] }> {
    return this.getPositions({ status: 'CLOSED', limit });
  },

  async closePosition(positionId: number): Promise<{ ok: boolean; message: string }> {
    const response = await api.post('/api/positions/close', { position_id: positionId });
    return response.data;
  },
};


