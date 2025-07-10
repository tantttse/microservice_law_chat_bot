import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";
import { Expose } from "class-transformer";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: user@example.com
 *         firstName:
 *           type: string
 *           description: The user's first name
 *           minLength: 2
 *           maxLength: 50
 *           example: John
 *         lastName:
 *           type: string
 *           description: The user's last name
 *           minLength: 2
 *           maxLength: 50
 *           example: Doe
 *         password:
 *           type: string
 *           description: The user's password
 *           minLength: 6
 *           example: password123
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           default: true
 *           example: true
 */
export class CreateUserDto {
  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Expose()
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Expose()
  lastName: string;

  @IsString()
  @MinLength(6)
  @Expose()
  password: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  isActive?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address
 *           example: newemail@example.com
 *         firstName:
 *           type: string
 *           description: Updated first name
 *           minLength: 2
 *           maxLength: 50
 *           example: Jane
 *         lastName:
 *           type: string
 *           description: Updated last name
 *           minLength: 2
 *           maxLength: 50
 *           example: Smith
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: false
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user has admin privileges
 *           example: true
 */
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @Expose()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Expose()
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Expose()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Expose()
  isAdmin?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the user
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: user@example.com
 *         firstName:
 *           type: string
 *           description: The user's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: The user's last name
 *           example: Doe
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user has admin privileges
 *           example: false
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *           example: '2025-06-15T10:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *           example: '2025-06-15T10:30:00Z'
 */
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  isAdmin: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
