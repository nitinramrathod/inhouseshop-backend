import cloudinary from "../config/cloudinary";
import fs from "fs";
import path from "path";
import { UploadApiResponse } from "cloudinary";

interface FilePart {
  filename: string;
  file: NodeJS.ReadableStream;
}

const uploadCloudinary = async (part: FilePart): Promise<string> => {
  const tempDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filePath = path.join(tempDir, part.filename);

  // Write the file fully
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);

    part.file.pipe(writeStream);

    part.file.on("end", () => resolve());   // ✅ Ensure request body is consumed
    part.file.on("error", reject);
    writeStream.on("error", reject);
  });

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder: "inhouseshop",
    });

    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new Error("Upload failed");
  }
};

export default uploadCloudinary;
