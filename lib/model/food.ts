import mongoose, { Document, Schema, model,Types } from "mongoose";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ifood extends Document {
  id: Types.ObjectId;
  userId: Schema.Types.ObjectId;
  foodName: string;
  carbs: number;
  protein: number;
  calorie: number;
  fat: number;
  mealType: MealType;
  imageUrl: string;
  storageKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const foodSchema = new Schema<Ifood>(
  {
    id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    calorie: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    storageKey: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Food = model<Ifood>("Food", foodSchema);

export default Food;