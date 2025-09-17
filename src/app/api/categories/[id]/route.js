import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const catObj = category.toObject();

    // Construct full S3 URLs if keys exist
    if (catObj.icon) {
      catObj.icon = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.icon}`;
    }
    if (catObj.image) {
      catObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.image}`;
    }

    return NextResponse.json(catObj);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
