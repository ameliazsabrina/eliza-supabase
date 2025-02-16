import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Pool } from "pg";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Initialize PostgreSQL client
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

app.post("/api/characters", async (req, res) => {
  try {
    const newCharacterConfig = req.body;

    // Validate required fields based on schema
    const requiredFields = ["name", "bio", "style"];
    const missingFields = requiredFields.filter(
      (field) => !newCharacterConfig[field]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const newCharacter = {
      name: newCharacterConfig.name,
      bio: newCharacterConfig.bio,
      style: newCharacterConfig.style,
      config: {
        name: newCharacterConfig.name,
        bio: newCharacterConfig.bio,
        style: newCharacterConfig.style,
      },
      created_at: new Date(),
    };

    const query = `
      INSERT INTO characters (name, bio, style, config, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      newCharacter.name,
      newCharacter.bio,
      newCharacter.style,
      newCharacter.config,
      newCharacter.created_at,
    ];
    const { rows } = await pool.query(query, values);

    // Ensure the characters directory exists
    const charactersDir = path.join(__dirname, "characters");
    if (!fs.existsSync(charactersDir)) {
      fs.mkdirSync(charactersDir, { recursive: true });
    }

    // Save the character to a local JSON file
    const filePath = path.join(
      charactersDir,
      `${newCharacterConfig.name}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(newCharacter, null, 2), "utf8");

    res.status(201).json({
      success: true,
      message: "Character saved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error saving character: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/:contractAddress/message", async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { text, userId } = req.body;

    if (!text || !userId || !contractAddress) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body." });
    }

    const responseText = `Echo from ${contractAddress}: ${text}`;
    const query = `
      INSERT INTO room_chats (contract_address, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [contractAddress, userId, { text }];
    const { rows } = await pool.query(query, values);

    res.status(200).json([{ text: responseText }]);
  } catch (error) {
    console.error("Error processing agent message: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process agent message" });
  }
});

app.get("/api/:contractAddress/message", async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const query = `
      SELECT * FROM room_chats
      WHERE contract_address = $1
      ORDER BY timestamp ASC;
    `;
    const values = [contractAddress];
    const { rows } = await pool.query(query, values);

    res.status(200).json({ success: true, chats: rows });
  } catch (error) {
    console.error("Error fetching room chats: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch room chats" });
  }
});

app.post("/api/:contractAddress/message", async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { text, userId } = req.body;

    if (!text || !userId || !contractAddress) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body." });
    }

    const responseText = `Echo from ${contractAddress}: ${text}`;
    const query = `
      INSERT INTO room_chats (contract_address, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [contractAddress, userId, { text }];
    const { rows } = await pool.query(query, values);

    res.status(200).json([{ text: responseText }]);
  } catch (error) {
    console.error("Error processing agent message: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process agent message" });
  }
});

// Start the API server
app.listen(port, () => {
  console.log(`API Server listening on port ${port}`);
});
