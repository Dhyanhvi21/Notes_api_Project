const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
CREATE NOTE
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      "INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
GET ALL NOTES
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
GET NOTE BY ID
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
UPDATE NOTE
*/
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE notes
       SET title = $1, content = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [title, content, req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
DELETE NOTE
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
