import { FastifyRequest } from "fastify";
import {uploadToCloudinary} from "./uploadCloudinary";

type ParsedFields = Record<string, any>;

const tryParseJSON = (value: string) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  // Quick check — avoids parsing normal strings
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const bodyParser = async (request:FastifyRequest):Promise<ParsedFields> => {
    let fields:ParsedFields = {};
    const parts = request.parts();

    for await (const part of parts) {
        if (part.type === 'file') {
            try {      
                console.log("file==>", part.fieldname);       
                fields[part.fieldname] = await uploadToCloudinary(part.file, "inhouseshop/products");
            } catch (error) {
                console.log('saving to cloudinary error==>', error);
            }
        } else {            
          fields[part.fieldname] = tryParseJSON(part.value as string);           
        }
    }
    return fields
}

export default bodyParser;