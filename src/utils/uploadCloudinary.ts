import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (stream: NodeJS.ReadableStream, folder: string) => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.pipe(uploadStream);
  });
};
