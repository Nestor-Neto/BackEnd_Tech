import { ICryptoCurrencyRepository } from '../../domain/repositories/ICryptoCurrencyRepository';
import { CryptoCurrencyApiClient, ApiResponse } from '../clients/CryptoCurrencyApiClient';

export class CryptocurrencyRepository implements ICryptoCurrencyRepository {
  constructor(private apiClient: CryptoCurrencyApiClient) {}

  async list(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.getLatestListings();
      return response;
    } catch (error) {
      console.error('Erro ao listar criptomoedas:', error);
      throw new Error('Falha ao listar criptomoedas');
    }
  }

  async findByName(name: string): Promise<ApiResponse | null> {
    try {
      const response = await this.apiClient.getLatestListings();
      const filteredData = response.data.filter(crypto => 
        crypto.name.toLowerCase() === name.toLowerCase()
      );
      
      if (filteredData.length === 0) {
        return null;
      }

      return {
        data: filteredData,
        status: response.status
      };
    } catch (error) {
      console.error(`Erro ao buscar criptomoeda por nome ${name}:`, error);
      throw new Error(`Falha ao buscar criptomoeda por nome ${name}`);
    }
  }

  async findById(id: string): Promise<ApiResponse | null> {
    try {
      const response = await this.apiClient.getLatestListings();
      const filteredData = response.data.filter(crypto => crypto.id.toString() === id);
      
      if (filteredData.length === 0) {
        return null;
      }

      return {
        data: filteredData,
        status: response.status
      };
    } catch (error) {
      console.error(`Erro ao buscar criptomoeda por ID ${id}:`, error);
      throw new Error(`Falha ao buscar criptomoeda por ID ${id}`);
    }
  }

  async findBySymbol(symbol: string): Promise<ApiResponse | null> {
    try {
      const [metadata, quotes] = await Promise.all([
        this.apiClient.getMetadata(symbol),
        this.apiClient.getQuotes([symbol])
      ]);

      if (!metadata.data || !quotes.data) {
        return null;
      }

      return {
        data: metadata.data,
        status: metadata.status
      };
    } catch (error) {
      console.error(`Erro ao buscar criptomoeda ${symbol}:`, error);
      throw new Error(`Falha ao buscar criptomoeda ${symbol}`);
    }
  }
} 