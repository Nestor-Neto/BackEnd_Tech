import axios, { AxiosInstance } from 'axios';
import { cryptoCurrencyConfig } from '../../config/cryptoCurrency.config';

interface QuoteData {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

interface Quote {
  [key: string]: QuoteData; // Permite qualquer moeda (USD, BTC, ETH, etc.)
}

interface CryptocurrencyData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank?: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: any | null;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: Quote;
}

interface ApiStatus {
  timestamp: string;
  error_code: number;
  error_message: string;
  elapsed: number;
  credit_count: number;
  notice?: string | null;
}

export interface ApiResponse {
  data: CryptocurrencyData[];
  status: ApiStatus;
}

export class CryptoCurrencyApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: cryptoCurrencyConfig.baseUrl,
      headers: {
        'X-CMC_PRO_API_KEY': cryptoCurrencyConfig.apiKey,
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Obtém a lista mais recente de criptomoedas
   * @param limit Número máximo de resultados (opcional)
   * @param start Posição inicial para paginação (opcional)
   * @returns Promise com os dados das criptomoedas
   */
  async getLatestListings(limit?: number, start?: number): Promise<ApiResponse> {
    try {
      const params = {
        limit: limit || 20,
        start: start || 1,
        convert: 'USD' //  moeda de conversão padrão
      };

      const response = await this.client.get<ApiResponse>(cryptoCurrencyConfig.endpoints.latest, { params });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter lista de criptomoedas:', error);
      throw new Error('Falha ao obter dados das criptomoedas');
    }
  }

  /**
   * Obtém metadados de uma criptomoeda específica
   * @param symbol Símbolo da criptomoeda (ex: BTC)
   * @returns Promise com os metadados da criptomoeda
   */
  async getMetadata(symbol: string): Promise<ApiResponse> {
    try {
      const params = {
        symbol: symbol.toUpperCase()
      };

      const response = await this.client.get<ApiResponse>(cryptoCurrencyConfig.endpoints.metadata, { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter metadados da criptomoeda ${symbol}:`, error);
      throw new Error(`Falha ao obter metadados da criptomoeda ${symbol}`);
    }
  }

  /**
   * Obtém cotações atualizadas de criptomoedas específicas
   * @param symbols Array de símbolos das criptomoedas
   * @returns Promise com as cotações das criptomoedas
   */
  async getQuotes(symbols: string[]): Promise<ApiResponse> {
    try {
      const params = {
        symbol: symbols.map(s => s.toUpperCase()).join(','),
        convert: 'USD' //  moeda de conversão padrão
      };

      const response = await this.client.get<ApiResponse>(cryptoCurrencyConfig.endpoints.quotes, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter cotações:', error);
      throw new Error('Falha ao obter cotações das criptomoedas');
    }
  }
} 