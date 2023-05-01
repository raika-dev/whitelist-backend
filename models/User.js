import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  address: {
    type: String,
  },
  timestamps: {
    type: [Date],
  },
  xp: {
    type: Number,
  },
});

export const UserDB = model("User", UserSchema);
