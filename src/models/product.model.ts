import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  specifications: {
    processor: string;
    ram: string;
    storage: string;
    graphics: string;
    display: string;
    os: string;
  };
  images: string[];
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },

    description: { type: String, required: true },

    price: { type: Number, required: true },
    discountPrice: Number,

    stock: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },

    specifications: {
      processor: String,
      ram: String,
      storage: String,
      graphics: String,
      display: String,
      os: String,
    },

    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
