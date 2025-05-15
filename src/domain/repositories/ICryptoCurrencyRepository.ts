import { ApiResponse } from '../../infrastructure/clients/CryptoCurrencyApiClient';

export interface ICryptoCurrencyRepository {
  list(): Promise<ApiResponse>;
  findByName(name: string): Promise<ApiResponse | null>;
  findById(id: string): Promise<ApiResponse | null>;
  findBySymbol(symbol: string): Promise<ApiResponse | null>;
} 