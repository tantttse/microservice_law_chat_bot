import { prisma } from "../services/prisma.service";

export interface CreateDocumentData {
  title: string;
  filename: string;
  originalFilename: string;
  path: string;
  type: string;
  size: number;
  description?: string;
  uploadedBy: number;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  isActive?: boolean;
  filename?: string;
  originalFilename?: string;
  path?: string;
  type?: string;
  size?: number;
  updatedBy?: string;
}

export class DocumentRepository {
  constructor() {}

  async create(data: CreateDocumentData) {
    return (prisma.document as any).create({
      data: {
        title: data.title,
        filename: data.filename,
        originalFilename: data.originalFilename,
        path: data.path,
        type: data.type,
        size: data.size,
        description: data.description,
        uploadedBy: data.uploadedBy,
        createdBy: `user_${data.uploadedBy}`,
        updatedBy: `user_${data.uploadedBy}`,
      },
    });
  }

  async findById(id: number) {
    return (prisma.document as any).findUnique({
      where: { id },
    });
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      type?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, isActive, type } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (type) {
      where.type = type;
    }

    const [documents, total] = await Promise.all([
      (prisma.document as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      (prisma.document as any).count({ where }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data: documents,
      meta: {
        total,
        page,
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findActiveDocuments() {
    return (prisma.document as any).findMany({
      where: { isActive: true },
      // include: {
      //   uploader: {
      //     select: {
      //       id: true,
      //       firstName: true,
      //       lastName: true,
      //       email: true,
      //     },
      //   },
      // },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async update(id: number, data: UpdateDocumentData) {
    return (prisma.document as any).update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: number) {
    return (prisma.document as any).delete({
      where: { id },
    });
  }

  async setActiveDocuments(documentIds: number[], userId: number) {
    // First, deactivate all documents
    await (prisma.document as any).updateMany({
      data: {
        isActive: false,
        updatedBy: `user_${userId}`,
        updatedAt: new Date(),
      },
    });

    // Then activate the selected documents
    if (documentIds.length > 0) {
      await (prisma.document as any).updateMany({
        where: {
          id: { in: documentIds },
        },
        data: {
          isActive: true,
          updatedBy: `user_${userId}`,
          updatedAt: new Date(),
        },
      });
    }

    return this.findActiveDocuments();
  }

  async searchByContent(query: string) {
    return (prisma.document as any).findMany({
      where: {
        isActive: true,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });
  }
}
