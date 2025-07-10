import { Request, Response, NextFunction } from "express";
import { ConversationService } from "../services/conversation.service";
import {
  CreateConversationDto,
  UpdateConversationDto,
} from "../common/dtos/conversation.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";
import { plainToClass } from "class-transformer";

export class ConversationController {
  private service: ConversationService;

  constructor() {
    this.service = new ConversationService();
  }

  /**
   * @swagger
   * /conversations:
   *   post:
   *     tags: [Conversations]
   *     summary: Create a new conversation
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateConversationDto'
   *     responses:
   *       201:
   *         description: Conversation created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ConversationResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   *       401:
   *         description: Unauthorized - Login required
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const dto = plainToClass(CreateConversationDto, req.body);

      dto.userId = userId;
      dto.createdBy = `user_${userId}`;

      const result = await this.service.create(dto);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /conversations:
   *   get:
   *     tags: [Conversations]
   *     summary: Get all conversations for the authenticated user with pagination, sorting, and filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: The page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 10
   *         description: The number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term to filter conversations by title or content
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, title, updatedAt]
   *         description: Field to sort by
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order (ascending or descending)
   *       - in: query
   *         name: filters
   *         schema:
   *           type: string
   *         description: "JSON string of filters (e.g. {\"userId\": 1})"
   *     responses:
   *       200:
   *         description: List of conversations
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ConversationResponseDto'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total number of conversations
   *                     page:
   *                       type: integer
   *                       description: Current page number
   *                     lastPage:
   *                       type: integer
   *                       description: Total number of pages
   *                     hasNextPage:
   *                       type: boolean
   *                       description: Whether there is a next page
   *                     hasPreviousPage:
   *                       type: boolean
   *                       description: Whether there is a previous page
   *       400:
   *         description: Bad request - Invalid query parameters
   */
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const userId = req.user?.userId;
      // if (!userId) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      const query = plainToClass(PaginationQueryDto, req.query);

      // Add user filter to ensure users only see their own conversations
      let filters: any = {};
      if (query.filters) {
        if (typeof query.filters === "string") {
          filters = JSON.parse(query.filters);
        } else {
          filters = query.filters;
        }
      }
      //filters.userId = userId;
      query.filters = filters;

      const result = await this.service.findAll(query);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /conversations/{id}:
   *   get:
   *     tags: [Conversations]
   *     summary: Get a conversation by ID (must be owned by authenticated user)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Conversation ID
   *     responses:
   *       200:
   *         description: Conversation found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ConversationResponseDto'
   *       404:
   *         description: Conversation not found
   */
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      console.log("User ID:", userId);
      const id = parseInt(req.params.id);
      const result = await this.service.findById(id);

      // Check if conversation exists and belongs to the user
      if (!result) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (result.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this conversation" });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /conversations/{id}:
   *   put:
   *     tags: [Conversations]
   *     summary: Update a conversation
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Conversation ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateConversationDto'
   *     responses:
   *       200:
   *         description: Conversation updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ConversationResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   *       404:
   *         description: Conversation not found
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);

      // First check if conversation exists and belongs to user
      const existingConversation = await this.service.findById(id);
      if (!existingConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (existingConversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this conversation" });
      }

      const updateDto = plainToClass(UpdateConversationDto, req.body);
      updateDto.updatedBy = `user_${userId}`;

      const result = await this.service.update(id, updateDto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /conversations/{id}:
   *   delete:
   *     tags: [Conversations]
   *     summary: Delete a conversation
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Conversation ID
   *     responses:
   *       204:
   *         description: Conversation deleted successfully
   *       404:
   *         description: Conversation not found
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);

      // First check if conversation exists and belongs to user
      const existingConversation = await this.service.findById(id);
      if (!existingConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (existingConversation.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Access denied to this conversation" });
      }

      await this.service.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
