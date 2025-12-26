import { Schema, model, Document, Types } from "mongoose";

/**
 * Cart Item sub-document
 */
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number; // snapshot price at time of add
}

/**
 * Cart document
 */
export interface ICart extends Document {
  ownerType: "USER" | "GUEST";
  ownerId: string; // userId OR guestId
  items: ICartItem[];
  totalAmount: number;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    ownerType: {
      type: String,
      enum: ["USER", "GUEST"],
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Ensures:
 * - One cart per user
 * - One cart per guest
 */
cartSchema.index(
  { ownerType: 1, ownerId: 1 },
  { unique: true }
);

export default model<ICart>("Cart", cartSchema);
