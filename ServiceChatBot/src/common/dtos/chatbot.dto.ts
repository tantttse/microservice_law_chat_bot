import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { Expose } from "class-transformer";

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRequestDto:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User's question about Vietnamese traffic law
 *           minLength: 1
 *           maxLength: 1000
 *           example: "What is the speed limit on highways in Vietnam?"
 *         conversationId:
 *           type: integer
 *           description: Optional conversation ID to continue existing conversation (only for logged-in users)
 *           example: 1
 *         isGuest:
 *           type: boolean
 *           description: Whether this is a guest user (temporary conversation)
 *           example: false
 */
export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @Expose()
  message: string;

  @IsOptional()
  @Expose()
  conversationId?: number;

  @IsOptional()
  @Expose()
  isGuest?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatResponseDto:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           description: AI assistant's response about Vietnamese traffic law
 *           example: "In Vietnam, the speed limit on highways is typically 120 km/h for cars..."
 *         conversationId:
 *           type: integer
 *           description: ID of the conversation (null for guest users)
 *           example: 1
 *         messageId:
 *           type: integer
 *           description: ID of the created message record (null for guest users)
 *           example: 5
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the response was generated
 *           example: "2025-06-28T10:30:00Z"
 *         isGuest:
 *           type: boolean
 *           description: Whether this was a guest conversation
 *           example: false
 *         isNewConversation:
 *           type: boolean
 *           description: Whether a new conversation was created for this message
 *           example: true
 */
export class ChatResponseDto {
  @Expose()
  response: string;

  @Expose()
  conversationId?: number;

  @Expose()
  messageId?: number;

  @Expose()
  timestamp: Date;

  @Expose()
  isGuest: boolean;

  @Expose()
  isNewConversation?: boolean;
}
