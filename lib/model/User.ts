import mongoose, { Document, Schema, model } from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
  id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  dailyCalorieIntake: number;
  dailyCalorieGaol: number;
  onboardingCompleted: boolean;
  comperePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: Schema.Types.ObjectId,
       default: () => new mongoose.Types.ObjectId(), 
    required: true,
    unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "is invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength:[6, "Password must be at least 6 characters long"],
      maxlength:[32, "Password must be at most 128 characters long"],
    },
    dailyCalorieIntake: {
      type: Number,
      required: true,
      default: 2000,
    },
    dailyCalorieGaol: {
      type: Number,
      required: true,
      default: 0,
    },
    onboardingCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// pre save
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) {
    return 
  }

  this.password = await argon2.hash(this.password);
});
userSchema.methods.comperePassword = async function (password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
};

const User = model<IUser>("User", userSchema);
export default User;

