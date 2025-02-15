import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post("/api/create-room", async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: "Missing roomId" });
  }

  const { data, error } = await supabase.rpc("create_room", {
    room_id: roomId,
  });

  if (error) {
    console.error("Error creating room:", error.message);
    return res.status(500).json({ error: "Failed to create room" });
  }

  res.status(200).json({ message: "Room created successfully", data });
});

// ---------- POST /api/characters ----------
// Receives character configuration from FE and saves it to the "characters" table
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

    // Construct the complete character object
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

    // Insert into the "characters" table
    const { data, error } = await supabase
      .from("characters")
      .insert([newCharacter]);

    if (error) {
      console.error("Error inserting character: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }

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
      data,
    });
  } catch (error) {
    console.error("Error saving character: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- GET /api/characters ----------
// Retrieves a list of saved character configurations from the "characters" table
app.get("/api/characters", async (req, res) => {
  try {
    const { data, error } = await supabase.from("characters").select("*");

    if (error) {
      console.error("Error fetching characters: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch characters" });
    }

    res.status(200).json({ success: true, characters: data });
  } catch (error) {
    console.error("Error fetching characters: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch characters" });
  }
});

// ---------- GET /api/room/:walletAddress/chats ----------
// Retrieves chat logs (prompt & response) for a given room (using wallet_address) from the "room_chats" table
app.get("/api/room/:walletAddress/chats", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { data, error } = await supabase
      .from("room_chats")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching room chats: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch room chats" });
    }

    res.status(200).json({ success: true, chats: data });
  } catch (error) {
    console.error("Error fetching room chats: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch room chats" });
  }
});

// ---------- POST /:contractAddress/:walletAddress/message ----------
// Simulates sending a message to an agent, returns a response, and saves the prompt/response pair in the "room_chats" table.
app.post("/api/:contractAddress/:walletAddress/message", async (req, res) => {
  try {
    const { contractAddress, walletAddress } = req.params;
    const { text, userId } = req.body;

    if (!text || !userId || !contractAddress) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body." });
    }

    const responseText = `Echo from ${contractAddress}: ${text}`;
    const { data, error } = await supabase.from("room_chats").insert([
      {
        wallet_address: walletAddress,
        contract_address: contractAddress,
        prompt: text,
        response: responseText,
        timestamp: new Date(),
      },
    ]);

    if (error) {
      console.error("Error inserting room chat: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to process agent message" });
    }

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
