import pool from "./db_pool.js";
import multer from "multer";

import { Router } from "express";
const router = Router();

// Configure Multer to store files in "uploads/" directory
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "uploads/";
      fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// Add this to your existing routes
router.get("/posts", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        Post.id,
        Post.contents,
        Post.attachments,
        Post.created_at,
        Account.name AS user_name,
        Account.username AS user_handle
      FROM Post
      INNER JOIN Account ON Post.account_id = Account.id
      ORDER BY Post.created_at DESC;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) client.release();
  }
});

router.post("/attachment/upload", (req, res) => {
  upload.single("file")(req, res, async function (err) {
    // Error handling
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "File error: " + err.message });
      }
      return res.status(500).json({ error: "Unexpected error" });
    }

    // No file check
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `INSERT INTO Attachment (file_path)
         VALUES ($1)
         RETURNING id, file_path;`,
        [`/uploads/${req.file.filename}`], // Use URL-friendly path
      );

      res.status(201).json({
        message: "File uploaded successfully",
        attachmentId: result.rows[0].id,
        filePath: result.rows[0].file_path,
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database operation failed" });
    } finally {
      if (client) client.release();
    }
  });
});

router.post("/account/user/sign-up", async (req, res) => {
  const { email, name, username, password } = req.body;

  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO Account (email, name, username, password)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
      `,
      [email, name, username, password],
    );
    await client.query("COMMIT");

    res.sendStatus(200);
  } catch (error) {
    if (client) await client.query("ROLLBACK");

    console.error(error);

    res.status(500).send(error);
  } finally {
    if (client) client.release();
  }
});

router.post("/account/business/sign-up", async (req, res) => {
  const {
    email,
    name,
    username,
    password,
    location,
    category,
    phone_number,
    description,
    collage_attachments,
  } = req.body;

  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    // Insert into the Account table and return the new id.
    const accountResult = await client.query(
      `
      INSERT INTO Account (email, name, username, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
      `,
      [email, name, username, password],
    );

    const accountId = accountResult.rows[0].id;

    // Insert into the Business table using the new accountId.
    // Note: The POINT type in PostgreSQL can be set with the POINT(x, y) function.
    await client.query(
      `
      INSERT INTO Business (account_id, location, category, phone_number, description, collage_attachments)
      VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [
        accountId,
        location,
        category,
        phone_number,
        description,
        collage_attachments, // If your array is already in the correct format
      ],
    );

    await client.query("COMMIT");

    res.sendStatus(200);
  } catch (error) {
    if (client) await client.query("ROLLBACK");

    console.error(error);

    res.status(500).send(error);
  } finally {
    if (client) client.release();
  }
});

router.post("/account/sign-in", async (req, res) => {
  const { email, password } = req.body;

  let client;

  try {
    client = await pool.connect();

    // Retrieve the user by username and password (since no hashing is used)
    const result = await client.query(
      "SELECT id FROM Account WHERE email = $1 AND password = $2;",
      [email, password],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);

    res.status(500).send(error);
  } finally {
    if (client) client.release();
  }
});

router.post("/create-post", async (req, res) => {
  const { account_id, contents, attachments } = req.body; // Add account_id
  let client;

  try {
    client = await pool.connect();

    // Insert the new post
    await client.query(
      `INSERT INTO Post (account_id, contents, attachments)
     VALUES ($1, $2, $3)`,
      [account_id, contents, attachments],
    );

    res.status(201).json({
      message: "Post created successfully",
      postId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) client.release();
  }
});

router.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    // Query the database for the post by ID
    const result = await client.query(
      `
      SELECT * FROM Post WHERE id = $1;
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) client.release();
  }
});

router.post("/support-business", async (req, res) => {
  const { account_id, business_id } = req.body;
  let client;

  try {
    client = await pool.connect();

    // Insert support record
    const result = await client.query(
      `
      INSERT INTO Support (account_id, business_id)
      VALUES ($1, $2)
      RETURNING id;
      `,
      [account_id, business_id],
    );

    res.status(201).json({
      message: "Business supported successfully",
      supportId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error supporting business:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid account_id or business_id",
      });
    }

    res.status(500).send("Server error");
  } finally {
    if (client) client.release();
  }
});

export default router;
