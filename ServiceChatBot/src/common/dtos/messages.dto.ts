import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMessageDto:
 *       type: object
 *       required:
 *         - conversationId
 *         - question
 *         - answer
 *       properties:
 *         conversationId:
 *           type: integer
 *           description: ID of the conversation this message belongs to
 *           example: 1
 *         question:
 *           type: string
 *           description: The question being asked
 *           example: What is AI?
 *         answer:
 *           type: string
 *           description: The answer to the question
 *           example: AI stands for Artificial Intelligence.
 *         createdBy:
 *           type: string
 *           description: The user who created the message
 *           example: user@example.com
 */
export class CreateMessageDto {
  @IsNumber()
  @Expose()
  conversationId: number;

  @IsString()
  @MinLength(1)
  @Expose()
  question: string;

  @IsString()
  @MinLength(1)
  @Expose()
  answer: string;

  @IsOptional()
  @IsString()
  @Expose()
  createdBy?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMessageDto:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           description: Updated question text
 *           example: What is the latest AI model?
 *         answer:
 *           type: string
 *           description: Updated answer text
 *           example: GPT-4 is one of the latest advanced models.
 *         updatedBy:
 *           type: string
 *           description: The user who last updated the message
 *           example: admin@example.com
 */
export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Expose()
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Expose()
  answer?: string;

  @IsOptional()
  @IsString()
  @Expose()
  updatedBy?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     MessageResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique ID of the message
 *           example: 123
 *         conversationId:
 *           type: integer
 *           description: Related conversation ID
 *           example: 1
 *         question:
 *           type: string
 *           description: The original question text
 *           example: What is AI?
 *         answer:
 *           type: string
 *           description: The answer to the question
 *           example: AI stands for Artificial Intelligence.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the message was created
 *           example: 2025-06-15T10:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the message was last updated
 *           example: 2025-06-15T10:30:00Z
 *         createdBy:
 *           type: string
 *           description: Who created the message
 *           example: user@example.com
 *         updatedBy:
 *           type: string
 *           description: Who last updated the message
 *           example: admin@example.com
 */
export class MessageResponseDto {
  @Expose()
  id: number;

  @Expose()
  conversationId: number;

  @Expose()
  question: string;

  @Expose()
  answer: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;
}
