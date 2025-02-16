import { settings } from "@elizaos/core";
import readline from "readline";
import axios from "axios";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("SIGINT", () => {
  rl.close();
  process.exit(0);
});

async function handleUserInput(input, agentId) {
  if (input.toLowerCase() === "exit") {
    rl.close();
    process.exit(0);
  }

  try {
    const serverPort = parseInt(settings.SERVER_PORT || "3000");

    const response = await axios.post(
      `http://localhost:${serverPort}/${agentId}/message`,
      {
        text: input,
        userId: "user",
        userName: "User",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.API_KEY}`,
        },
      }
    );

    const data = response.data;
    // Handle both array and single response formats
    const messages = Array.isArray(data) ? data : [data];
    messages.forEach((message) => console.log(`${"Agent"}: ${message.text}`));
  } catch (error) {
    console.error("Error fetching response:", error);
  }
}

export function startChat(characters, runtime) {
  function chat() {
    const agentId = runtime.agentId;
    rl.question("You: ", async (input) => {
      await handleUserInput(input, agentId);
      if (input.toLowerCase() !== "exit") {
        chat(); // Loop back to ask another question
      }
    });
  }

  return chat;
}
