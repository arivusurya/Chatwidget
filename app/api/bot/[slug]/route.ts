import { getbotInfo } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } } // No `await` needed for params
) {
  try {
    const { slug } = context.params; // Correct access to params
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
