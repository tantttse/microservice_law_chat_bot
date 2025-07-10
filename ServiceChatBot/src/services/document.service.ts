import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentResponseDto,
} from "../common/dtos/document.dto";
import {
  DocumentRepository,
  CreateDocumentData,
  UpdateDocumentData,
} from "../repository/document.repository";
import { APIError } from "../common/errors/app-errors";

export class DocumentService {
  private repository: DocumentRepository;
  private uploadsDir: string;
  private geminiService: any = null; // Will be set by dependency injection

  constructor() {
    this.repository = new DocumentRepository();
    this.uploadsDir = path.join(process.cwd(), "src", "uploads", "documents");

    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Set GeminiService instance for cache refresh
   */
  setGeminiService(geminiService: any): void {
    this.geminiService = geminiService;
  }

  /**
   * Refresh document cache in GeminiService if available
   */
  private async refreshDocumentCache(): Promise<void> {
    if (
      this.geminiService &&
      typeof this.geminiService.refreshCache === "function"
    ) {
      try {
        await this.geminiService.refreshCache();
      } catch (error) {
        console.error("Failed to refresh document cache:", error);
      }
    }
  }

  async create(
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    userId: number
  ): Promise<DocumentResponseDto> {
    try {
      // Validate file type
      const allowedTypes = [
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new APIError(
          "INVALID_FILE_TYPE",
          400,
          "Only TXT and DOCX files are allowed"
        );
      }

      // Generate unique filename using UUID
      const fileExtension = path.extname(file.originalname);
      const uniqueId = uuidv4();
      const filename = `${uniqueId}${fileExtension}`;
      const filePath = path.join(this.uploadsDir, filename);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create document record
      const documentData: CreateDocumentData = {
        title: dto.title,
        filename,
        originalFilename: file.originalname,
        path: filePath,
        type: fileExtension.substring(1), // Remove the dot
        size: file.size,
        description: dto.description,
        uploadedBy: userId,
      };

      const result = await this.repository.create(documentData);

      // Refresh document cache
      await this.refreshDocumentCache();

      return result;
    } catch (error) {
      console.error("Error uploading document:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("UPLOAD_ERROR", 500, "Failed to upload document");
    }
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      type?: string;
    } = {}
  ) {
    return await this.repository.findAll(options);
  }

  async findById(id: number): Promise<DocumentResponseDto> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new APIError("DOCUMENT_NOT_FOUND", 404, "Document not found");
    }
    return document;
  }

  async update(
    id: number,
    dto: UpdateDocumentDto
  ): Promise<DocumentResponseDto> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new APIError("DOCUMENT_NOT_FOUND", 404, "Document not found");
    }

    const updateData: UpdateDocumentData = {
      title: dto.title,
      description: dto.description,
      isActive: dto.isActive,
    };

    const result = await this.repository.update(id, updateData);

    // Refresh document cache
    await this.refreshDocumentCache();

    return result;
  }

  async updateFile(
    id: number,
    file: Express.Multer.File,
    userId: number
  ): Promise<DocumentResponseDto> {
    try {
      // Check if document exists
      const document = await this.repository.findById(id);
      if (!document) {
        throw new APIError("DOCUMENT_NOT_FOUND", 404, "Document not found");
      }

      // Validate file type
      const allowedTypes = [
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new APIError(
          "INVALID_FILE_TYPE",
          400,
          "Only TXT and DOCX files are allowed"
        );
      }

      // Delete old file from filesystem
      try {
        if (fs.existsSync(document.path)) {
          fs.unlinkSync(document.path);
        }
      } catch (error) {
        console.error("Error deleting old file:", error);
      }

      // Generate new unique filename using UUID
      const fileExtension = path.extname(file.originalname);
      const uniqueId = uuidv4();
      const filename = `${uniqueId}${fileExtension}`;
      const filePath = path.join(this.uploadsDir, filename);

      // Save new file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Update document record
      const updateData: UpdateDocumentData = {
        filename,
        originalFilename: file.originalname,
        path: filePath,
        type: fileExtension.substring(1), // Remove the dot
        size: file.size,
        updatedBy: `user_${userId}`,
      };

      const updatedDocument = await this.repository.update(id, updateData);

      // Refresh document cache in GeminiService
      await this.refreshDocumentCache();

      return updatedDocument;
    } catch (error) {
      console.error("Error updating document file:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "UPDATE_FILE_ERROR",
        500,
        "Failed to update document file"
      );
    }
  }

  async delete(id: number): Promise<DocumentResponseDto> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new APIError("DOCUMENT_NOT_FOUND", 404, "Document not found");
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    const result = await this.repository.delete(id);

    // Refresh document cache
    await this.refreshDocumentCache();

    return result;
  }

  async setActiveDocuments(documentIds: number[], userId: number) {
    // Validate that all documents exist
    const documents = await Promise.all(
      documentIds.map((id) => this.repository.findById(id))
    );

    const notFound = documents.findIndex((doc: any) => !doc);
    if (notFound !== -1) {
      throw new APIError(
        "DOCUMENT_NOT_FOUND",
        404,
        `Document with ID ${documentIds[notFound]} not found`
      );
    }

    const result = await this.repository.setActiveDocuments(
      documentIds,
      userId
    );

    // Refresh document cache
    await this.refreshDocumentCache();

    return result;
  }

  async getActiveDocuments() {
    return await this.repository.findActiveDocuments();
  }

  private async extractDocxText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Error extracting DOCX text:", error);
      throw new APIError(
        "DOCX_EXTRACTION_ERROR",
        400,
        "Failed to extract text from DOCX"
      );
    }
  }

  private async readDocumentContent(document: any): Promise<string> {
    try {
      if (!fs.existsSync(document.path)) {
        console.warn(`File not found: ${document.path}`);
        return "";
      }

      const buffer = fs.readFileSync(document.path);

      if (document.type === "txt") {
        return fs.readFileSync(document.path, "utf-8");
      } else if (document.type === "docx") {
        return await this.extractDocxText(buffer);
      } else {
        console.warn(`Unsupported file type: ${document.type}`);
        return "";
      }
    } catch (error) {
      console.error(`Error reading document content: ${document.path}`, error);
      return "";
    }
  }

  async getActiveDocumentsWithContent() {
    const activeDocuments = await this.repository.findActiveDocuments();
    const documentsWithContent = await Promise.all(
      activeDocuments.map(async (doc: any) => {
        const content = await this.readDocumentContent(doc);
        return {
          ...doc,
          content,
        };
      })
    );
    return documentsWithContent;
  }
}
