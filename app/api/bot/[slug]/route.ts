import { getbotInfo } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is missing" },
        { status: 400 }
      );
    }

    const botinfo = await getbotInfo({ slug }); // Fetch bot info from the database

    // Return successful response
    return NextResponse.json(
      {
        message: `Data for bot with ID ${slug} retrieved successfully`,
        data: botinfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error);

    // Return error response
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}
