import { createCustomer } from "@/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const queryParams = req.nextUrl.searchParams;
    const paramValue = queryParams.get("user"); // Replace "paramName" with the name of the parameter you need

    // Log the parameter values
    console.log("Parameter value:", paramValue);

    return NextResponse.json(
      { message: "Success", paramValue },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse JSON body from the POST request

    console.log("Received body:", body);

    await createCustomer(body);
    // Process the data as needed, e.g., create an entry in your database

    return NextResponse.json(
      { message: "Data created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}
