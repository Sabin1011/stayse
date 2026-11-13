
import { v2 as cloudinary } from "cloudinary";

import type {
  ImageStorage,
  UploadedImage,
} from "../../application/interfaces/services/image-storage.interface.js";

import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryImageStorage implements ImageStorage {
  async upload(
    file: Buffer,
    folder: string,
  ): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload returned no result"));
            return;
          }

          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file);
    });
  }

  async delete(publicId: string): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(
        `Cloudinary image deletion failed: ${result.result}`,
      );
    }
  }
}
