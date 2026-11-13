
import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";

import type { ImageStorage } from "../interfaces/services/image-storage.interface.js";

export interface UploadProfileImageInput {
  userId: string;
  file: Buffer;
}

export class UploadProfileImageUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageStorage: ImageStorage,
  ) {}

  async execute(input: UploadProfileImageInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Keep the existing image details for replacement.
    const previousPublicId = user.profileImagePublicId;

    // Upload the new image to Cloudinary.
    const uploadedImage = await this.imageStorage.upload(
      input.file,
      "stayse/profiles",
    );

    try {
      // Update the domain entity.
      user.changeProfileImage(
        uploadedImage.imageUrl,
        uploadedImage.publicId,
      );

      // Persist the updated user.
      const updatedUser = await this.userRepository.updateProfile(user);

      // Delete the previous image only after database success.
      if (previousPublicId) {
        try {
          await this.imageStorage.delete(previousPublicId);
        } catch (error) {
          // The new image is saved. Log cleanup failure for later retry.
          console.error("Failed to delete previous profile image:", error);
        }
      }

      return {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email.getValue(),
        profileImageUrl: updatedUser.profileImageUrl,
        status: updatedUser.status,
      };
    } catch (error) {
      // Database update failed: attempt to clean up the new upload.
      try {
        await this.imageStorage.delete(uploadedImage.publicId);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded profile image:", cleanupError);
      }

      throw error;
    }
  }
}
