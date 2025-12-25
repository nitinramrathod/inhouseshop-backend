import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcryptjs';

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

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User document
 */
export interface IUser extends Document ,IUserMethods{
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


userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>("User", userSchema);