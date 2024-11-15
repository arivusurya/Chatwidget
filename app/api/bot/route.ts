import { createbot, getBotAndSource } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse FormData from the POST request
    const formdata = await req.formData();
    const file = formdata.get("file") as File | null;
    const name = formdata.get("name") as string;
    const website = formdata.get("website") as string;
    const topic = formdata.get("topic") as string;

    if (!file || !name || !website) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert file to a buffer to pass to PDFLoader

    await createbot({ file: file, name, website, topic });

    return NextResponse.json(
      { message: "Data created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await getBotAndSource();
    return NextResponse.json({ data: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}
