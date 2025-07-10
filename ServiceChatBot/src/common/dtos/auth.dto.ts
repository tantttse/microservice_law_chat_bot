import { IsString, IsEmail, MinLength, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: User's password
 *           example: password123
 */
export class LoginDto {
  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  @MinLength(6)
  @Expose()
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: newuser@example.com
 *         password:
 *           type: string
 *           description: User's password
 *           minLength: 6
 *           example: password123
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Doe
 */
export class RegisterDto {
  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  @MinLength(6)
  @Expose()
  password: string;

  @IsString()
  @MinLength(2)
  @Expose()
  firstName: string;

  @IsString()
  @MinLength(2)
  @Expose()
  lastName: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponseDto:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserResponseDto'
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         message:
 *           type: string
 *           description: Success message
 *           example: Login successful
 */
export class AuthResponseDto {
  @Expose()
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isActive: boolean;
  };

  @Expose()
  token: string;

  @Expose()
  message: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePasswordDto:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Current password
 *           example: oldpassword123
 *         newPassword:
 *           type: string
 *           description: New password
 *           minLength: 6
 *           example: newpassword123
 */
export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @Expose()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @Expose()
  newPassword: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileDto:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: Updated first name
 *           minLength: 2
 *           example: John
 *         lastName:
 *           type: string
 *           description: Updated last name
 *           minLength: 2
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address
 *           example: newemail@example.com
 */
export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @Expose()
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @Expose()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Expose()
  email?: string;
}
