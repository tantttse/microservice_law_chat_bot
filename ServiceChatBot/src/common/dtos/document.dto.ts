import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  IsNumber,
} from "class-validator";
import { Expose, Type } from "class-transformer";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateDocumentDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The document title
 *           minLength: 1
 *           maxLength: 255
 *           example: Vietnamese Traffic Law 2024
 *         description:
 *           type: string
 *           description: Optional document description
 *           maxLength: 1000
 *           example: Complete traffic law regulations for Vietnam
 */
export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Expose()
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Expose()
  description?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateDocumentDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated document title
 *           minLength: 1
 *           maxLength: 255
 *           example: Updated Traffic Law 2024
 *         description:
 *           type: string
 *           description: Updated document description
 *           maxLength: 1000
 *           example: Updated description
 *         isActive:
 *           type: boolean
 *           description: Whether the document is active for chatbot reference
 *           example: true
 */
export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @Expose()
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Expose()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  isActive?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SetActiveDocumentsDto:
 *       type: object
 *       required:
 *         - documentIds
 *       properties:
 *         documentIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of document IDs to set as active
 *           example: [1, 2, 3]
 */
export class SetActiveDocumentsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose()
  documentIds: number[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Document ID
 *           example: 1
 *         title:
 *           type: string
 *           description: Document title
 *           example: Vietnamese Traffic Law 2024
 *         filename:
 *           type: string
 *           description: UUID-based filename on disk
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx
 *         originalFilename:
 *           type: string
 *           description: Original filename from upload
 *           example: traffic-law.docx
 *         path:
 *           type: string
 *           description: File path on server
 *           example: /uploads/documents/a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx
 *         type:
 *           type: string
 *           description: File type (txt or docx)
 *           enum: [txt, docx]
 *           example: docx
 *         size:
 *           type: integer
 *           description: File size in bytes
 *           example: 2048576
 *         isActive:
 *           type: boolean
 *           description: Whether document is active for chatbot
 *           example: true
 *         description:
 *           type: string
 *           description: Document description
 *           example: Complete traffic law regulations for Vietnam
 *         uploadedBy:
 *           type: integer
 *           description: ID of user who uploaded the document
 *           example: 1
 *         uploader:
 *           type: object
 *           description: Information about the user who uploaded the document
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             firstName:
 *               type: string
 *               example: John
 *             lastName:
 *               type: string
 *               example: Doe
 *             email:
 *               type: string
 *               example: admin@example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Document creation timestamp
 *           example: 2025-07-03T10:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Document last update timestamp
 *           example: 2025-07-03T10:30:00Z
 */
export class DocumentResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  filename: string;

  @Expose()
  originalFilename: string;

  @Expose()
  path: string;

  @Expose()
  type: string;

  @Expose()
  size: number;

  @Expose()
  isActive: boolean;

  @Expose()
  description?: string;

  @Expose()
  uploadedBy: number;

  @Expose()
  @Type(() => Object)
  uploader: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentListResponseDto:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DocumentResponseDto'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of documents
 *               example: 10
 *             page:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             lastPage:
 *               type: integer
 *               description: Last page number
 *               example: 3
 *             hasNextPage:
 *               type: boolean
 *               description: Whether there's a next page
 *               example: true
 *             hasPreviousPage:
 *               type: boolean
 *               description: Whether there's a previous page
 *               example: false
 */
export class DocumentListResponseDto {
  @Expose()
  @Type(() => DocumentResponseDto)
  data: DocumentResponseDto[];

  @Expose()
  @Type(() => Object)
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
