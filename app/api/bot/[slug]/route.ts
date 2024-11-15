import { getbotInfo } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params; // Directly access slug from params
    const botinfo = await getbotInfo({ slug }); // Fetch bot info from the database
    console.log("Received ID:", slug);

    // Respond with bot info
    return NextResponse.json(
      {
        message: `Data for bot with ID ${slug} retrieved successfully`,
        data: botinfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}
