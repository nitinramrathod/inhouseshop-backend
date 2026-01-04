import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  brand: string;
  category: Types.ObjectId;
  description: string;
  price: number;
  discountedPrice?: number;
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
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true 
    },

    description: { type: String, required: true },

    price: { type: Number, required: true },
    discountedPrice: {type: Number, required: false},

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
