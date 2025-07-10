import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "../common/dtos/user.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";
import { UserRepository } from "../repository/user.repository";
import { plainToClass } from "class-transformer";
import { APIError } from "../common/errors/app-errors";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.repository.findByEmail(dto.email);
      if (existingUser) {
        throw new APIError(
          "USER_EXISTS",
          409,
          "User with this email already exists"
        );
      }

      const user = await this.repository.create(dto);
      return plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("CREATE_USER_FAILED", 500, "Failed to create user");
    }
  }

  async findById(id: number): Promise<UserResponseDto> {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }
      return plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("FETCH_USER_FAILED", 500, "Failed to fetch user");
    }
  }

  async findAll(query: PaginationQueryDto): Promise<{
    data: UserResponseDto[];
    meta: {
      total: number;
      page: number;
      lastPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const result = await this.repository.findAll(query);
      const lastPage = Math.ceil(result.total / limit);

      const users = result.data.map((user) =>
        plainToClass(UserResponseDto, user, { excludeExtraneousValues: true })
      );

      return {
        data: users,
        meta: {
          total: result.total,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new APIError("FETCH_USERS_FAILED", 500, "Failed to fetch users");
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }

      // Check if email is being updated and if it's already taken
      if (dto.email && dto.email !== existingUser.email) {
        const userWithEmail = await this.repository.findByEmail(dto.email);
        if (userWithEmail) {
          throw new APIError(
            "EMAIL_EXISTS",
            409,
            "User with this email already exists"
          );
        }
      }

      const user = await this.repository.update(id, dto);
      return plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("UPDATE_USER_FAILED", 500, "Failed to update user");
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("DELETE_USER_FAILED", 500, "Failed to delete user");
    }
  }
}
