import { PaginationQueryDto } from '../dtos/pagination.dto';

export interface BaseRepository<T> {
  create(data: any): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(query?: PaginationQueryDto): Promise<{ data: T[]; total: number }>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}
