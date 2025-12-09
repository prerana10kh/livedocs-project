// // app/api/save-document/route.ts
// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import Document from "@/models/Document";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { roomId, title, content, creatorId, email } = body;

//     if (!roomId) {
//       return NextResponse.json(
//         { message: "roomId is required" },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Upsert: create if not exists, otherwise update
//     await Document.findOneAndUpdate(
//       { roomId },
//       { roomId, title, content, creatorId, email },
//       { upsert: true, new: true }
//     );

//     return NextResponse.json({ message: "Saved to MongoDB" }, { status: 200 });
//   } catch (error) {
//     console.error("Save error:", error);
//     return NextResponse.json(
//       { message: "Error saving document" },
//       { status: 500 }
//     );
//   }
// }










// app/api/save-document/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Document from "@/models/Document";

export async function POST(req: Request) {
  try {
    const { title, content, creatorId, email } = await req.json();

    if (!title || !creatorId || !email) {
      return NextResponse.json(
        { message: "title, creatorId, email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create a NEW document every time
    await Document.create({
      title,
      content,
      creatorId,
      email,
    });

    return NextResponse.json({ message: "Saved to MongoDB" }, { status: 200 });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { message: "Error saving document" },
      { status: 500 }
    );
  }
}
