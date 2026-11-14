
import multer from "multer";
import type { RequestHandler } from "express";

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      callback(
        new Error("Only PDF, JPEG and PNG files are allowed"),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadHostDocument: RequestHandler = (
  req,
  res,
  next,
) => {
  upload.single("document")(req, res, (error: unknown) => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "File upload failed";

      res.status(400).json({
        success: false,
        message,
      });

      return;
    }

    next();
  });
};
