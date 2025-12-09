// models/Document.ts
import mongoose, { Schema, models } from "mongoose";


const DocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed },
    creatorId: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);


const Document =
  models.Document || mongoose.model("Document", DocumentSchema);

export default Document;
