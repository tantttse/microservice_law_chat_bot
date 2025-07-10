import jwt, { SignOptions } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../common/dtos/auth.dto";
import { UserRepository } from "../repository/user.repository";
import { plainToClass } from "class-transformer";
import { APIError } from "../common/errors/app-errors";

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new APIError(
          "USER_EXISTS",
          409,
          "User with this email already exists"
        );
      }

      // Create new user
      const user = await this.userRepository.create({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isActive: true,
      });

      return plainToClass(
        AuthResponseDto,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
          },
          message: "Registration successful",
        },
        { excludeExtraneousValues: true }
      );
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("REGISTRATION_FAILED", 500, "Registration failed");
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      // Find user by email (including password for verification)
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        throw new APIError(
          "INVALID_CREDENTIALS",
          401,
          "Invalid email or password"
        );
      }

      // Check if user is active
      if (!user.isActive) {
        throw new APIError("ACCOUNT_DISABLED", 401, "Account is disabled");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new APIError(
          "INVALID_CREDENTIALS",
          401,
          "Invalid email or password"
        );
      }

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.isAdmin);

      return plainToClass(
        AuthResponseDto,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
          },
          token,
          message: "Login successful",
        },
        { excludeExtraneousValues: true }
      );
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("LOGIN_FAILED", 500, "Login failed");
    }
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    try {
      // Find user with password
      const userWithPassword = await this.userRepository.findByIdWithPassword(
        userId
      );
      if (!userWithPassword) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        userWithPassword.password
      );
      if (!isCurrentPasswordValid) {
        throw new APIError(
          "INVALID_PASSWORD",
          400,
          "Current password is incorrect"
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update password - we need to add password field to UpdateUserDto
      await this.userRepository.update(userId, {
        password: hashedNewPassword,
      } as any);

      return { message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "CHANGE_PASSWORD_FAILED",
        500,
        "Failed to change password"
      );
    }
  }

  async getProfile(userId: number): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "GET_PROFILE_FAILED",
        500,
        "Failed to get user profile"
      );
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<any> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new APIError("USER_NOT_FOUND", 404, "User not found");
      }

      // Check if email is being updated and if it's already taken
      if (dto.email && dto.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(dto.email);
        if (userWithEmail) {
          throw new APIError(
            "EMAIL_EXISTS",
            409,
            "User with this email already exists"
          );
        }
      }

      // Update user profile
      const updatedUser = await this.userRepository.update(userId, dto);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "UPDATE_PROFILE_FAILED",
        500,
        "Failed to update user profile"
      );
    }
  }

  private generateToken(
    userId: number,
    email: string,
    isAdmin: boolean
  ): string {
    const payload = { userId, email, isAdmin };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "24h" });
  }

  verifyToken(token: string): {
    userId: number;
    email: string;
    isAdmin: boolean;
  } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: number;
        email: string;
        isAdmin: boolean;
      };
      return decoded;
    } catch (error) {
      throw new APIError("INVALID_TOKEN", 401, "Invalid or expired token");
    }
  }
}
