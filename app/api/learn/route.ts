import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import compromise from "compromise";
import { embeddings } from "@/ai";
import { v4 as uuid } from "uuid";
import { createEmbeddings, createsource } from "@/db";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File | null;
  const keywordFrequency: { [key: string]: number } = {}; // Track frequency of each keyword phrase

  if (file) {
    let sourceid = uuid();
    let buffer = await file.arrayBuffer();

    const blob = new Blob([buffer]);
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    for (const doc of splitDocs) {
      const cleanedText = doc.pageContent
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const key = compromise(cleanedText);
      const embedding = await embeddings.embedQuery(cleanedText);
      const embeddingArray = `{${embedding.join(", ")}}`;
      await createEmbeddings({ cleanedText, sourceid, embeddingArray });

      // Store document and embedding vector

      const phrases = key.match("#Adjective? #Noun #Noun").out("array"); // Select two-word noun phrases

      phrases.forEach((phrase: string) => {
        // Clean up any extraneous symbols or punctuation
        const cleanedPhrase = phrase.replace(/[.,;:!?'"”“‘’]/g, "").trim();

        // Filter out single words and common stop phrases
        if (
          cleanedPhrase.split(" ").length === 2 &&
          !isStopWord(cleanedPhrase)
        ) {
          if (keywordFrequency[cleanedPhrase]) {
            keywordFrequency[cleanedPhrase]++;
          } else {
            keywordFrequency[cleanedPhrase] = 1;
          }
        }
      });
    }

    // Sort keywords by frequency and get the top 100
    const topKeywords = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency in descending order
      .slice(0, 100) // Get top 100
      .map(([keyword]) => keyword); // Extract keyword only

    const source = await createsource({
      sourceid,
      documentname: file.name,
      documenttype: file.type,
      data: blob,
      keywords: topKeywords,
    });

    return NextResponse.json({ data: source });
  } else {
    return NextResponse.json({ data: "No file is found" });
  }
}

// Utility function to filter out common stop words, conjunctions, etc.
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "and",
    "or",
    "but",
    "if",
    "then",
    "than",
    "so",
    "because",
    "though",
    "although",
    "while",
    "when",
    "where",
    "how",
    "in",
    "on",
    "at",
    "by",
    "about",
    "for",
    "with",
    "without",
    "as",
    "of",
    "to",
    "from",
    "like",
    "some",
    "many",
    "much",
    "more",
    "most",
    "few",
    "several",
    "all",
    "any",
    "each",
    "one",
    "two",
    "three",
    "every",
    "section",
    "element",
    "life",
    "story",
  ]);
  return stopWords.has(word.toLowerCase());
}
