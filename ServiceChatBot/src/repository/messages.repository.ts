import { BaseRepository } from "../common/interfaces/base.interface";
import { prisma } from "../services/prisma.service";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "../common/dtos/messages.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";

// Define the Message type based on the Prisma model
type Message = {
  id: number;
  conversationId: number;
  question: string;
  answer: string;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
};

export class MessageRepository implements BaseRepository<Message> {
  async create(data: CreateMessageDto): Promise<Message> {
    return prisma.message.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: number): Promise<Message | null> {
    return prisma.message.findUnique({
      where: { id },
    });
  }

  async findAll(
    query?: PaginationQueryDto
  ): Promise<{ data: Message[]; total: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || "createdAt";
    const sortOrder = query?.sortOrder || "desc";
    const search = query?.search;
    const filters = query?.filters || {};

    // Build where clause
    const where: any = {
      ...filters,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { context: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.message.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        // include: {
        //     messages: true
        // }
      }),
      prisma.message.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: number, data: UpdateMessageDto): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  }
}
