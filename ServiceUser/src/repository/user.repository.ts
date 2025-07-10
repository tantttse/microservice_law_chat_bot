import { prisma } from "../services/prisma.service";
import { CreateUserDto, UpdateUserDto } from "../common/dtos/user.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";
import * as bcrypt from "bcrypt";

// Import the User type from Prisma
type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Custom interface for User repository since User uses integer IDs
interface UserRepositoryInterface {
  create(data: CreateUserDto): Promise<Omit<User, "password">>;
  findById(id: number): Promise<Omit<User, "password"> | null>;
  findAll(
    query?: PaginationQueryDto
  ): Promise<{ data: Omit<User, "password">[]; total: number }>;
  update(id: number, data: UpdateUserDto): Promise<Omit<User, "password">>;
  delete(id: number): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByIdWithPassword(id: number): Promise<User | null>;
}

export class UserRepository implements UserRepositoryInterface {
  async create(data: CreateUserDto): Promise<Omit<User, "password">> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from results
      },
    });

    return user;
  }

  async findById(id: number): Promise<Omit<User, "password"> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from results
      },
    });
  }

  async findAll(
    query?: PaginationQueryDto
  ): Promise<{ data: Omit<User, "password">[]; total: number }> {
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
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password from results
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async update(
    id: number,
    data: UpdateUserDto
  ): Promise<Omit<User, "password">> {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from results
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByIdWithPassword(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
