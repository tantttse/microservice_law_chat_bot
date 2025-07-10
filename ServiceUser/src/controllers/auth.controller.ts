import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../common/dtos/auth.dto";
import { plainToClass } from "class-transformer";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterDto'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   *       409:
   *         description: User with this email already exists
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(RegisterDto, req.body);
      const result = await this.authService.register(dto);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Login user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginDto'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponseDto'
   *       401:
   *         description: Invalid credentials
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(LoginDto, req.body);
      const result = await this.authService.login(dto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current user profile
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *       401:
   *         description: Unauthorized - Invalid token
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.authService.getProfile(userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/change-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Change user password
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ChangePasswordDto'
   *     responses:
   *       200:
   *         description: Password changed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Password changed successfully
   *       400:
   *         description: Bad request - Invalid current password
   *       401:
   *         description: Unauthorized - Invalid token
   */
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dto = plainToClass(ChangePasswordDto, req.body);
      const result = await this.authService.changePassword(userId, dto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: Logout user (client-side token removal)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Logout successful
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For JWT tokens, logout is typically handled client-side
      // by removing the token from storage
      return res.json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/profile:
   *   put:
   *     tags: [Authentication]
   *     summary: Update user profile
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileDto'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *       400:
   *         description: Bad request - Invalid input
   *       401:
   *         description: Unauthorized - Invalid token
   *       409:
   *         description: Email already exists
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dto = plainToClass(UpdateProfileDto, req.body);
      const result = await this.authService.updateProfile(userId, dto);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
