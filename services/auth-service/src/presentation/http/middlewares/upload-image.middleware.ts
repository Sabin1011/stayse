
import multer from "multer";

export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new Error("Only JPEG, PNG and WebP images are allowed"),
      );
      return;
    }

    callback(null, true);
  },
});
