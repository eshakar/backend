import Note from "../models/Note.js";

export const getAnalytics = async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [byUser, byTag, perDay] = await Promise.all([
      Note.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$owner", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Note.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Note.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    res.json({ byUser, byTag, perDay });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Analytics calculation failed" });
  }
};
