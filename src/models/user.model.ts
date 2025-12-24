import mongoose, { Schema, Document } from "mongoose";

/**
 * Address sub-document
 */
export interface IUserAddress {
  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  type: "HOME" | "WORK";
  isDefault: boolean;
}

/**
 * User document
 */
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role: "BUYER" | "SELLER" | "ADMIN";
  isActive: boolean;

  addresses: IUserAddress[];
}

const addressSchema = new Schema<IUserAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },

    addressLine1: { type: String, required: true },
    addressLine2: String,

    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "India" },
    pincode: { type: String, required: true },

    type: { type: String, enum: ["HOME", "WORK"], default: "HOME" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false } // important: prevents extra _id per address
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["BUYER", "SELLER", "ADMIN"],
      default: "BUYER",
    },

    isActive: { type: Boolean, default: true },

    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);