import { Cryptocurrency } from '../../entities/Cryptocurrency';

export interface ICryptocurrencyRepository {
  create(cryptocurrency: Cryptocurrency): Promise<Cryptocurrency>;
  findById(id: string): Promise<Cryptocurrency | null>;
  findBySymbol(symbol: string): Promise<Cryptocurrency | null>;
  update(id: string, cryptocurrency: Partial<Cryptocurrency>): Promise<Cryptocurrency>;
  delete(id: string): Promise<void>;
  list(): Promise<Cryptocurrency[]>;
  updatePrices(): Promise<void>;
} 