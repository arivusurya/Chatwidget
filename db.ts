import pg from "pg";
import { BotInput, UserInfo } from "./types";
import { v4 as uuid } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { embeddings } from "./ai";
export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 8000,
  user: process.env.DB_USER || "postgres",
  password: "root",
  database: process.env.DB_NAME || "llmdb",
});

// Function to create the customers table
async function createCustomersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log("Customers table created or already exists.");
  } catch (error) {
    console.error("Error creating customers table:", error);
  } finally {
    client.release();
  }
}

async function SourceTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Source (
  sourceid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documentname VARCHAR(255) NOT NULL,
  documenttype VARCHAR(255) NOT NULL ,
  data BYTEA NOT NULL,  -- Storing binary data as BYTEA
  keywords TEXT[]     -- Storing keywords as an array of text
);

      `);
    console.log("Source table created or already exists.");
  } catch (error) {
    console.error("Error creating Bot table:", error);
  } finally {
    client.release();
  }
}
export async function createsource({
  sourceid,
  documentname,
  documenttype,
  data,
  keywords,
}: any) {
  const client = await pool.connect();
  console.log(documentname, documenttype, data, keywords);

  try {
    const result = await client.query(
      `INSERT INTO Source (sourceid, documentname, documenttype, data, keywords) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING sourceid, documentname, keywords`,
      [sourceid, documentname, documenttype, data, keywords]
    );

    // Log and return only the fields we want
    console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
}

export async function createEmbeddings({
  cleanedText,
  sourceid,
  embeddingArray,
}: any) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO "Embedding" ("id", "content", "sourceid", "vector")
       VALUES ($1, $2, $3, $4::float8[])  -- Specify type as array of floats
       RETURNING id`,
      [uuid(), cleanedText, sourceid, embeddingArray]
    );
    console.log("One embed inserted");
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
}
export async function getBotAndSourceInfo(botId: string) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT Bot.sourceid , Bot.name, Source.keywords
       FROM Bot
       INNER JOIN Source ON Bot.sourceid::UUID = Source.sourceid
       WHERE Bot.botid = $1`,
      [botId]
    );

    console.log("Query result:", result.rows);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching bot and source info:", error);
  } finally {
    client.release();
  }
}

async function CreateBotTable() {
  const client = await pool.connect();
  try {
    await client.query(`
        CREATE TABLE IF NOT EXISTS Bot (
          botid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          website VARCHAR(255) UNIQUE NOT NULL,
          sourceid VARCHAR(255)
        );
      `);
    console.log("Bot table created or already exists.");
  } catch (error) {
    console.error("Error creating Bot table:", error);
  } finally {
    client.release();
  }
}

export async function createbot(botinfo: BotInput) {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query("BEGIN");

    // Create bot entry
    const botId = uuid();
    await client.query(
      `INSERT INTO Bot (botid, name, website,topic) VALUES ($1, $2, $3, $4)`,
      [botId, botinfo.name, botinfo.website, botinfo.topic]
    );

    // Process PDF file if provided
    if (botinfo.file) {
      const blob = new Blob([botinfo.file]);
      const loader = new PDFLoader(blob);
      const docs = await loader.load();

      // Split the documents
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      const insertedDocs = [];
      for (const doc of splitDocs) {
        const cleanedText = doc.pageContent
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Embed text content
        const embedding = await embeddings.embedQuery(cleanedText);

        // Convert embedding array to PostgreSQL array format
        const embeddingArray = `{${embedding.join(", ")}}`;

        // Store document and embedding vector
        const result = await client.query(
          `INSERT INTO "Document" ("id", "content", "BotName", "vector")
             VALUES ($1, $2, $3, $4::float8[])  -- Specify type as array of floats
             RETURNING id`,
          [uuid(), cleanedText, botId, embeddingArray]
        );
        insertedDocs.push(result.rows[0].id);
      }
    }

    // Commit transaction
    await client.query("COMMIT");
    console.log("Bot created successfully");

    return {
      success: true,
      botId,
    };
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");
    console.error("Error in createbot:", error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

export async function getbotInfo({ slug }: { slug: string }) {
  const client = await pool.connect();
  try {
    const query = `select * from  Bot where botid=$1`;
    const result = await client.query(query, [slug]);
    console.log(result);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function createCustomer({ email, name }: UserInfo) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO customers (name, email)
VALUES ($1, $2)
ON CONFLICT (email) DO NOTHING;
`,
      [name, email]
    );
    console.log(result.rows[0]);
  } catch (error) {
    console.log(error);
  }
}
// Function to create the messages table with a foreign key to customers
async function createMessagesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sender VARCHAR(255) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        customer_id INT REFERENCES customers(id) ON DELETE CASCADE
      );
    `);
    console.log("Messages table created or already exists.");
  } catch (error) {
    console.error("Error creating messages table:", error);
  } finally {
    client.release();
  }
}

// Function to create the Document table with a vector extension
async function createDocumentTable() {
  const client = await pool.connect();
  try {
    // Ensure the vector extension is enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // Create the Document table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Embedding" (
        "id" TEXT PRIMARY KEY,
        "sourceid" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "vector" vector(768)
      );
    `);
    console.log("Document table created or already exists.");
  } catch (error) {
    console.error("Error creating Document table:", error);
  } finally {
    client.release();
  }
}

// Initialize all tables
export async function initializeTables() {
  await createCustomersTable();
  await createMessagesTable();
  await createDocumentTable();
  await CreateBotTable();
  await SourceTable();
}

export async function getBotAndSource() {
  const query = `
    SELECT 
      b.*, 
      s.sourceid, 
      s.documentname, 
      s.documenttype, 
      s.keywords 
    FROM 
      Source AS s
    LEFT JOIN 
      Bot AS b ON b.sourceid::uuid = s.sourceid
  `;

  const client = await pool.connect();
  try {
    const result = await client.query(query);

    // Separate data into bot info and source info arrays
    const botInfo: any = [];
    const sourceInfo: any = [];

    result.rows.forEach((row) => {
      const { sourceid, documentname, documenttype, keywords, ...botFields } =
        row;

      // Store the bot information only if it has non-null fields (i.e., a match was found)
      if (Object.values(botFields).some((value) => value !== null)) {
        botInfo.push(botFields);
      }

      // Add source info if it hasn't been added already
      sourceInfo.push({ sourceid, documentname, documenttype, keywords });
    });

    return { botInfo, sourceInfo };
  } catch (err) {
    console.error("Error fetching data:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Call the initialize function when the script runs
