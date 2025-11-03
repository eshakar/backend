import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { "sharedWith.user": req.user.id },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const hasAccess =
      note.owner.toString() === req.user.id ||
      note.sharedWith.some((s) => s.user.toString() === req.user.id);

    if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error fetching note" });
  }
}

export async function createNotes(req, res) {
  try {
    const { title, content } = req.body;
    const note = new Note({ title, content, owner: req.user.id });
    const saveNote = await note.save();
    res.status(201).json(saveNote);
  } catch (error) {
    res.status(500).json({ message: "Error creating note" });
  }
}

export async function updateNotes(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const hasWriteAccess =
      note.owner.toString() === req.user.id ||
      note.sharedWith.some(
        (s) => s.user.toString() === req.user.id && s.permission === "write"
      );

    if (!hasWriteAccess) return res.status(403).json({ message: "Forbidden" });

    note.title = req.body.title;
    note.content = req.body.content;
    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
}

export async function deleteNotes(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
}

export async function shareNote(req, res) {
  try {
    const { userId, permission } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const alreadyShared = note.sharedWith.find(
      (entry) => entry.user.toString() === userId
    );

    if (alreadyShared) {
      alreadyShared.permission = permission;
    } else {
      note.sharedWith.push({ user: userId, permission });
    }

    await note.save();
    res.status(200).json({ message: "Note shared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sharing note" });
  }
}
