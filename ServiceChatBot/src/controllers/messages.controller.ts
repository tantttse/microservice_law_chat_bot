import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services/messages.service";
import { ConversationService } from "../services/conversation.service";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "../common/dtos/messages.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";
import { plainToClass } from "class-transformer";

export class MessageController {
  private service: MessageService;
  private conversationService: ConversationService;

  constructor() {
    this.service = new MessageService();
    this.conversationService = new ConversationService();
  }

  /**
   * @swagger
   * /messages:
   *   post:
   *     tags: [Messages]
   *     summary: Create a new message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMessageDto'
   *     responses:
   *       201:
   *         description: Message created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const dto = plainToClass(CreateMessageDto, req.body);

      // Verify that the conversation belongs to the user
      const conversation = await this.conversationService.findById(
        dto.conversationId
      );
      if (conversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this conversation" });
      }

      // Set the createdBy field
      dto.createdBy = `user_${userId}`;

      const result = await this.service.create(dto);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /messages:
   *   get:
   *     tags: [Messages]
   *     summary: Get all messages with optional filtering by conversationId
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: conversationId
   *         schema:
   *           type: integer
   *           description: Filter by conversation ID
   *     responses:
   *       200:
   *         description: List of messages
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MessageResponseDto'
   */
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const query = plainToClass(PaginationQueryDto, req.query);

      // If a specific conversationId is provided, verify user owns it
      if (
        query.filters &&
        typeof query.filters === "object" &&
        "conversationId" in query.filters
      ) {
        const conversationId = query.filters.conversationId as number;
        const conversation = await this.conversationService.findById(
          conversationId
        );
        if (conversation.userId !== userId) {
          return res
            .status(403)
            .json({ message: "Access denied to this conversation" });
        }
      } else {
        // If no specific conversation, filter to only conversations owned by user
        // This requires joining with conversations table or pre-filtering
        // For now, we'll require conversationId to be specified
        return res.status(400).json({
          message: "conversationId filter is required to list messages",
        });
      }

      const result = await this.service.findAll(query);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /messages/{id}:
   *   get:
   *     tags: [Messages]
   *     summary: Get a message by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Message found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponseDto'
   *       404:
   *         description: Message not found
   */
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      const message = await this.service.findById(id);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Verify that the message belongs to a conversation owned by the user
      const conversation = await this.conversationService.findById(
        message.conversationId
      );
      if (conversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this message" });
      }

      return res.json(message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /messages/{id}:
   *   put:
   *     tags: [Messages]
   *     summary: Update a message
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateMessageDto'
   *     responses:
   *       200:
   *         description: Message updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponseDto'
   *       404:
   *         description: Message not found
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);

      // First check if message exists and belongs to user's conversation
      const existingMessage = await this.service.findById(id);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }

      const conversation = await this.conversationService.findById(
        existingMessage.conversationId
      );
      if (conversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this message" });
      }

      const dto = plainToClass(UpdateMessageDto, req.body);
      dto.updatedBy = `user_${userId}`;

      const result = await this.service.update(id, dto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /messages/{id}:
   *   delete:
   *     tags: [Messages]
   *     summary: Delete a message
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Message deleted successfully
   *       404:
   *         description: Message not found
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);

      // First check if message exists and belongs to user's conversation
      const existingMessage = await this.service.findById(id);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }

      const conversation = await this.conversationService.findById(
        existingMessage.conversationId
      );
      if (conversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this message" });
      }

      await this.service.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
