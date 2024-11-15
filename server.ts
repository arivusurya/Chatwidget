import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { getBotAndSourceInfo, initializeTables } from "./db"; // Import your db functions
import { chatModel, embeddings } from "./ai";
import { pool } from "./db";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  // Initialize the database tables
  await initializeTables(); // Ensure tables are created before starting the server
  console.log("Database tables initialized.");

  const greetWord = ["hi", "hello", "hey"];

  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // Fetch recent messages on join
    socket.on("joinRoom", async (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);

      // Fetch and emit recent messages from the database
      // const messages = await getMessages();
      // socket.emit("previousMessages", messages);

      socket
        .to(room)
        .emit("userJoined", `User ${socket.id} has joined the room.`);
    });

    // Send a message to a specific room and save it to the database
    socket.on("sendMessage", async ({ botid, id, content, sender }) => {
      console.log("On message");
      let client = await pool.connect();
      if (greetWord.includes(content.toLocaleLowerCase().trim(" "))) {
        console.log("This is the greeter word?");
        let message = {
          botid: botid,
          id: Date.now(),
          content: "Hi How may i help you?",
          sender: "bot",
        };
        return io.to(socket.id).emit("receiveMessage", message);
      }
      const botinfo = await getBotAndSourceInfo(botid);

      const queryEmbedding = await embeddings.embedQuery(content);

      const similarDocs = await client.query(
        `SELECT id, content, 1 - (vector <=> $1) as similarity
           FROM "Embedding"
            WHERE sourceid = $2
           ORDER BY vector <=> $1
           LIMIT 3`,
        [`[${queryEmbedding.join(",")}]`, botinfo.sourceid]
      );

      // // Format context from similar documents
      const context = similarDocs.rows.map((row) => row.content).join("\n\n");

      // const botInfo = {
      //   name: "Andrew The Bot", // Replace with actual bot name
      //   persona: "friendly and helpful", // Customize based on the `persona` column
      //   knowledge_scope: "SEO-related topics", // Customize based on `knowledge_scope` from Bot table
      //   main_topics: ["SEO basics", "keyword optimization", "content strategy"], // Example topics based on `main_topics` from Bot table
      //   work_instruction:
      //     "Provide clear, concise, and informative responses tailored to the user’s queries, using bullet points when needed.",
      // };

      // // System message to set up bot's context and instructions
      const systemMessage = new SystemMessage({
        content: `You are ${botinfo.name}, a skilled assistant specializing in ${botinfo.knowledge_scope}. Your tone is friendly and helpful. You are here to help users with the following topics: ${botinfo.keywords}
        )}. Provide clear, concise, and informative responses tailored to the user’s queries, using bullet points when needed.`,
      });

      // // Instructions for handling specific queries
      const messageInstruction = new HumanMessage({
        content: `You are a skilled FAQ assistant with a friendly and helpful tone. You are here to help users with ${botinfo.keywords} queries and provide answers based on the context provided.`,
      });

      const queryInstruction = new HumanMessage({
        content: `Based on the context below, answer the following question in a detailed and informative way:\n\n
          - Provide bullet points if needed.
          - Be thorough but concise in responses.
            Query: "${content}"\n
            Context:\n${context}`,
      });

      // // Final sequence of messages
      const initialInstructions = [
        systemMessage,
        messageInstruction,
        queryInstruction,
      ];

      const response = await chatModel.invoke([
        messageInstruction,
        queryInstruction,
      ]);

      // console.log("Response From ai ", response.content);
      let message = {
        botid: botid,
        id: Date.now(),
        content: response.content,
        // content: "Hi",
        sender: "bot",
      };
      io.to(socket.id).emit("receiveMessage", message);
    });

    // Leave a room

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Start the server
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
