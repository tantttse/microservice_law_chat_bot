import { BaseService } from '../common/interfaces/base.interface';
import { MessageRepository } from '../repository/messages.repository';
import { UpdateMessageDto, CreateMessageDto, MessageResponseDto } from '../common/dtos/messages.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dtos/pagination.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../common/errors/app-errors';

export class MessageService {
    private repository: MessageRepository;

    constructor() {
        this.repository = new MessageRepository();
    }

    async create(data: CreateMessageDto): Promise<MessageResponseDto> {
        // Validate DTO
        const errors = await validate(plainToClass(CreateMessageDto, data));
        if (errors.length > 0) {
            throw new AppError('Validation failed', 400, 'Validation failed', true, errors);
        }

        const message = await this.repository.create(data);
        return plainToClass(MessageResponseDto, message, { excludeExtraneousValues: true });
    }

    async findById(id: number): Promise<MessageResponseDto> {
        const message = await this.repository.findById(id);
        if (!message) {
            throw new AppError('Message not found', 404, 'Message not found', true);
        }
        return plainToClass(MessageResponseDto, message, { excludeExtraneousValues: true });
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<MessageResponseDto>> {
        const { data, total } = await this.repository.findAll(query);
        const messages = data.map(message => 
            plainToClass(MessageResponseDto, message, { excludeExtraneousValues: true })
        );
        const page = query.page || 1;
        const limit = query.limit || 10;
        const lastPage = Math.ceil(total / limit);
        
        return {
            data: messages,
            meta: {
                total,
                page,
                lastPage,
                hasNextPage: page < lastPage,
                hasPreviousPage: page > 1
            }
        };
    }

    async update(id: number, data: UpdateMessageDto): Promise<MessageResponseDto> {
        // Validate DTO
        const errors = await validate(plainToClass(UpdateMessageDto, data));
        if (errors.length > 0) {
            throw new AppError('Validation failed', 400, 'Validation failed', true, errors);
        }

        const message = await this.repository.update(id, data);
        return plainToClass(MessageResponseDto, message, { excludeExtraneousValues: true });
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

   
}