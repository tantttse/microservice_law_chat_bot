import { BaseRepository } from "../common/interfaces/base.interface";
import { prisma } from "../services/prisma.service";
import {
  CreateConversationDto,
  UpdateConversationDto,
} from "../common/dtos/conversation.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";

// Define the Conversation type based on the Prisma model
type Conversation = {
  id: number;
  userId: number;
  title: string | null;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
};

export class ConversationRepository implements BaseRepository<Conversation> {
  async create(data: CreateConversationDto): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: number): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }
  async findAll(
    query?: PaginationQueryDto
  ): Promise<{ data: Conversation[]; total: number }> {
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
      prisma.conversation.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          messages: true,
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: number, data: UpdateConversationDto): Promise<Conversation> {
    return prisma.conversation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }
}
