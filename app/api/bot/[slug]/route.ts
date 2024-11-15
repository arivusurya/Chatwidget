import { getbotInfo } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const botinfo = await getbotInfo({ slug });
    console.log("Received ID:", slug);

    // Process the ID as needed, e.g., fetch data from the database using this ID

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
