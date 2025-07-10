import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from "class-validator";
import { Expose, Transform } from "class-transformer";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateConversationDto:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *       properties:
 *         userId:
 *           type: integer
 *           description: The ID of the user creating the conversation
 *           example: 1
 *         title:
 *           type: string
 *           description: The title of the conversation
 *           minLength: 3
 *           maxLength: 100
 *           example: Traffic Law Question
 *         context:
 *           type: string
 *           description: Additional context for the conversation
 *           maxLength: 1000
 *           example: I need information about traffic regulations
 */
export class CreateConversationDto {
  @IsNumber()
  @Expose()
  userId: number;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Expose()
  title: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Expose()
  createdBy?: string | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateConversationDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated title of the conversation
 *           minLength: 3
 *           maxLength: 100
 *           example: Updated Traffic Law Question
 *         context:
 *           type: string
 *           description: Updated context for the conversation
 *           maxLength: 1000
 *           example: Updated information about traffic regulations
 */
export class UpdateConversationDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @Expose()
  title?: string;
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Expose()
  answer?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Expose()
  context?: string;

  @IsString()
  @IsOptional()
  @Expose()
  updatedBy?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ConversationResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the conversation
 *           example: 1
 *         userId:
 *           type: integer
 *           description: The ID of the user who created the conversation
 *           example: 1
 *         title:
 *           type: string
 *           description: The title/question of the conversation
 *           example: What are the speed limits in residential areas?
 *         answer:
 *           type: string
 *           description: The answer to the conversation question
 *           example: In residential areas, the speed limit is typically 30 km/h unless otherwise posted.
 *         context:
 *           type: string
 *           description: Additional context for the conversation
 *           example: Looking for specific information about speed limits in different zones
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the conversation was created
 *           example: '2025-06-15T10:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the conversation was last updated
 *           example: '2025-06-15T10:30:00Z'
 */
export class ConversationResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  title: string;

  @Expose()
  answer?: string;

  @Expose()
  context?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
