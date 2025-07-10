import { PaginationQueryDto } from '../dtos/pagination.dto';

export interface BaseRepository<T> {
  create(data: any): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(query?: PaginationQueryDto): Promise<{ data: T[]; total: number }>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

export interface BaseService<T, CreateDTO, UpdateDTO> {
  create(data: CreateDTO): Promise<T>;
  findById(id: number): Promise<T>;
  findAll(query: PaginationQueryDto): Promise<{ data: T[]; meta: { total: number; page: number; lastPage: number } }>;
  update(id: number, data: UpdateDTO): Promise<T>;
  delete(id: number): Promise<void>;
}
