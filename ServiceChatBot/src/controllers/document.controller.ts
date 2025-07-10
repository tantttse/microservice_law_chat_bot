import { Request, Response } from "express";
import multer from "multer";
import { DocumentService } from "../services/document.service";
import { APIError } from "../common/errors/app-errors";
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  SetActiveDocumentsDto,
} from "../common/dtos/document.dto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        `Invalid file type: ${file.mimetype}. Only TXT and DOCX files are allowed.`
      );
      cb(error as any, false);
    }
  },
});

export class DocumentController {
  private service: DocumentService;

  constructor() {
    this.service = new DocumentService();
  }

  // Multer middleware for file upload
  uploadMiddleware = upload.single("file");

  async create(req: Request, res: Response) {
    try {
      // Check if multer encountered an error
      if (!req.file) {
        throw new APIError("FILE_REQUIRED", 400, "File is required");
      }

      const { title, description } = req.body as CreateDocumentDto;

      if (!title || title.trim() === "") {
        throw new APIError("TITLE_REQUIRED", 400, "Title is required");
      }

      // Get user ID from authenticated user
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        throw new APIError("UNAUTHORIZED", 401, "User not authenticated");
      }

      const dto: CreateDocumentDto = {
        title,
        description,
      };

      const document = await this.service.create(req.file, dto, userId);

      res.status(201).json({
        success: true,
        data: document,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Upload document error:", error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10", isActive, type } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        isActive: isActive ? isActive === "true" : undefined,
        type: type as string,
      };

      const result = await this.service.findAll(options);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await this.service.findById(parseInt(id));

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Get document by ID error:", error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateDocumentDto;

      const document = await this.service.update(parseInt(id), updateData);

      res.json({
        success: true,
        data: document,
        message: "Document updated successfully",
      });
    } catch (error) {
      console.error("Update document error:", error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));

      res.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Delete document error:", error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    }
  }

  async setActiveDocuments(req: Request, res: Response) {
    try {
      const { documentIds } = req.body as SetActiveDocumentsDto;

      if (!Array.isArray(documentIds)) {
        throw new APIError(
          "INVALID_INPUT",
          400,
          "documentIds must be an array"
        );
      }

      // Get user ID from authenticated user
      const userId = parseInt(req.headers['x-user-id'] as string)
      if (!userId) {
        throw new APIError("UNAUTHORIZED", 401, "User not authenticated");
      }

      const activeDocuments = await this.service.setActiveDocuments(
        documentIds,
        userId
      );

      res.json({
        success: true,
        data: activeDocuments,
        message: "Active documents updated successfully",
      });
    } catch (error) {
      console.error("Set active documents error:", error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    }
  }

  async getActiveDocuments(req: Request, res: Response) {
    try {
      const activeDocuments = await this.service.getActiveDocuments();

      res.json({
        success: true,
        data: activeDocuments,
      });
    } catch (error) {
      console.error("Get active documents error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }

  async updateFile(req: Request, res: Response) {
    try {
      // Check if multer encountered an error
      if (!req.file) {
        throw new APIError("FILE_REQUIRED", 400, "File is required");
      }

      const { id } = req.params;
      const userId = parseInt(req.headers['x-user-id'] as string)

      if (!userId) {
        throw new APIError("UNAUTHORIZED", 401, "User not authenticated");
      }

      const isAdmin = req.headers['x-user-admin'] === 'true';
      // Check if user is admin
      if (!isAdmin) {
        throw new APIError("FORBIDDEN", 403, "Admin access required");
      }

      const document = await this.service.updateFile(
        parseInt(id),
        req.file,
        userId
      );

      res.json({
        success: true,
        data: document,
        message: "Document file updated successfully",
      });
    } catch (error) {
      console.error("Update document file error:", error);

      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            type: error.name,
            message: error.message,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          type: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
}
