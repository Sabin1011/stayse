
export interface UploadedImage {
  imageUrl: string;
  publicId: string;
}

export interface ImageStorage {
  upload(
    file: Buffer,
    folder: string,
  ): Promise<UploadedImage>;

  delete(publicId: string): Promise<void>;
}
