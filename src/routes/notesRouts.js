import express from "express";
import {
  createNotes,
  deleteNotes,
  getAllNotes,
  getNoteById,
  updateNotes,
  shareNote,
} from "../controller/noteController.js";
import { verifyToken } from "../middleware/auth.js";
import Note from "../models/Note.js";
import User from "../models/User.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNotes);
router.put("/:id", updateNotes);
router.delete("/:id", deleteNotes);
router.post("/:id/share", shareNote);
router.post("/:id/share", verifyToken, async (req, res) => {
  const { userId, permission } = req.body;
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Note not found" });
  if (note.owner.toString() !== req.user.id) return res.status(403).json({ message: "Only owner can share" });

  const alreadyShared = note.sharedWith.find((entry) => entry.user.toString() === userId);
  if (alreadyShared) {
    alreadyShared.permission = permission;
  } else {
    note.sharedWith.push({ user: userId, permission });
  }

  await note.save();
  res.status(200).json({ message: "Note shared successfully", note });
});

export default router;
