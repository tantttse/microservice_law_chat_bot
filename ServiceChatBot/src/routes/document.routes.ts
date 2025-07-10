import express from "express";
import { DocumentController } from "../controllers/document.controller";
//import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const documentController = new DocumentController();

// Apply authentication middleware to all routes
//router.use(authMiddleware.authenticate);

// Upload document with error handling
router.post(
  "/upload",
  (req, res, next) => {
    documentController.uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: {
            type: "UPLOAD_ERROR",
            message: err.message || "File upload failed",
          },
        });
      }
      next();
    });
  },
  documentController.create.bind(documentController)
);

// Get all documents with pagination and filters
router.get("/", documentController.findAll.bind(documentController));

// Get active documents (must come before /:id)
router.get(
  "/active",
  documentController.getActiveDocuments.bind(documentController)
);

// Get document by ID
router.get("/:id", documentController.findById.bind(documentController));

// Update document file (admin only)
router.put(
  "/:id/file",
  //authMiddleware.requireAdmin,
  (req, res, next) => {
    documentController.uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: {
            type: "UPLOAD_ERROR",
            message: err.message || "File upload failed",
          },
        });
      }
      next();
    });
  },
  documentController.updateFile.bind(documentController)
);

// Update document
router.put("/:id", documentController.update.bind(documentController));

// Delete document
router.delete("/:id", documentController.delete.bind(documentController));

// Set active documents
router.post(
  "/set-active",
  documentController.setActiveDocuments.bind(documentController)
);

export default router;
