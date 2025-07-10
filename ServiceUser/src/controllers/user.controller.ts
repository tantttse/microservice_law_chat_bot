import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateUserDto, UpdateUserDto } from "../common/dtos/user.dto";
import { PaginationQueryDto } from "../common/dtos/pagination.dto";
import { UserService } from "../services/user.service";

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     tags: [Users]
   *     summary: Create a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserDto'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   *       409:
   *         description: User with this email already exists
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(CreateUserDto, req.body);
      const result = await this.service.create(dto);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /users:
   *   get:
   *     tags: [Users]
   *     summary: Get all users with pagination, sorting, and filtering
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
   *         description: Search term to filter users by name or email
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, firstName, lastName, email]
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
   *         description: "JSON string of filters (e.g. {\"isActive\": true})"
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/UserResponseDto'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total number of users
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
      const query = plainToClass(PaginationQueryDto, req.query);
      const result = await this.service.findAll(query);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     tags: [Users]
   *     summary: Get a user by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *       404:
   *         description: User not found
   */
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.findById(id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     tags: [Users]
   *     summary: Update a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserDto'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *       404:
   *         description: User not found
   *       409:
   *         description: Email already exists
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const dto = plainToClass(UpdateUserDto, req.body);
      const result = await this.service.update(id, dto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     tags: [Users]
   *     summary: Delete a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
