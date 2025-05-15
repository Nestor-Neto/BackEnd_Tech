import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cryptocurrencies')
export class Cryptocurrency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 18, scale: 8 })
  currentPrice: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  marketCap: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  volume24h: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  priceChange24h: number;

  @Column({ type: 'timestamp' })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(data: Partial<Cryptocurrency>) {
    Object.assign(this, data);
  }
} 