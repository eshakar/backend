import mongoose from "mongoose";

const sharedWithSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  permission: { type: String, enum: ["read", "write"], default: "read" },
}, { _id: false });

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [sharedWithSchema],
  tags: [String],
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);
export default Note;
