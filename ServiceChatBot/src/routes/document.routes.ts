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
    console.log("Upload request received:", {
      headers: req.headers,
      contentType: req.get("content-type"),
      contentLength: req.get("content-length"),
    });

    documentController.uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("Upload middleware error:", err);

        // Handle specific multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: {
              type: "FILE_TOO_LARGE",
              message: "File size exceeds 10MB limit",
            },
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            error: {
              type: "UNEXPECTED_FILE",
              message: "Unexpected field name. Use 'file' as field name.",
            },
          });
        }

        if (err.message && err.message.includes("Unexpected end of form")) {
          return res.status(400).json({
            success: false,
            error: {
              type: "FORM_ERROR",
              message:
                "Form data is incomplete or corrupted. Please try again.",
            },
          });
        }

        return res.status(400).json({
          success: false,
          error: {
            type: "UPLOAD_ERROR",
            message: err.message || "File upload failed",
            code: err.code || "UNKNOWN_ERROR",
          },
        });
      }
      console.log("Upload middleware successful, proceeding to controller");
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
