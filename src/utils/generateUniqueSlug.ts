import slugify from "slugify";
import { Model, Document } from "mongoose";

interface SlugOptions {
  field?: string;          // default: "slug"
  separator?: string;      // default: "-"
}

/**
 * Generate a unique slug for any mongoose model
 */
export const generateUniqueSlug = async <T extends Document>(
  name: string,
  model: Model<T>,
  options?: SlugOptions
): Promise<string> => {
  const field = options?.field || "slug";
  const separator = options?.separator || "-";

  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  while (await model.exists({ [field]: slug })) {
    slug = `${baseSlug}${separator}${count}`;
    count++;
  }

  return slug;
};
