import connectToDB from "@/lib/mongodb";
import Tour from "@/models/Tour";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Init S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 🔗 helper to make full URL
function s3Url(key) {
  return key
    ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    : "";
}

// 🔄 upload file
async function uploadToS3(file, folder = "tours") {
  if (!file || file.size === 0) return "";

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return fileName; // only store key in DB
}

// ❌ delete file
async function deleteFromS3(key) {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    })
  );
}

// -------------------- GET --------------------
export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);

    if (searchParams.get("tour_id")) {
      const tourId = searchParams.get("tour_id");
      const tour = await Tour.findById(tourId).populate("placeId", "name");
      if (!tour)
        return NextResponse.json({ message: "Tour not found" }, { status: 404 });

      const bookedSeats = tour.totalSeats - tour.availableSeats;
      const remainingSeats = tour.availableSeats;

      return NextResponse.json(
        {
          ...tour._doc,
          img: s3Url(tour.img),
          bookedSeats,
          remainingSeats,
        },
        { status: 200 }
      );
    }

    const filter = {};
    if (searchParams.get("placeId")) filter.placeId = searchParams.get("placeId");

    const tours = await Tour.find(filter).populate("placeId", "name");
    const formatted = tours.map((tour) => {
      const bookedSeats = tour.totalSeats - tour.availableSeats;
      const remainingSeats = tour.availableSeats;
      return {
        ...tour._doc,
        img: s3Url(tour.img),
        bookedSeats,
        remainingSeats,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------- POST --------------------
export async function POST(req) {
  try {
    await connectToDB();
    const formData = await req.formData();

    const title = formData.get("title");
    const price = parseFloat(formData.get("price")) || 0;
    const placeId = formData.get("placeId");
    const totalSeats = parseInt(formData.get("totalSeats"), 10) || 100;
    const perPersonLimit = parseInt(formData.get("perPersonLimit"), 10) || 5;

    const files = formData.getAll("img");
    let img = "";
    if (files.length > 0) img = await uploadToS3(files[0]);

    if (!title || !price || !placeId || !img) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tour = await Tour.create({
      title,
      price,
      img,
      placeId,
      totalSeats,
      availableSeats: totalSeats,
      perPersonLimit,
    });

    return NextResponse.json({ ...tour._doc, img: s3Url(tour.img) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------- PUT --------------------
export async function PUT(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Tour id is required" }, { status: 400 });

    const formData = await req.formData();
    const updateData = {};

    if (formData.get("title")) updateData.title = formData.get("title");
    if (formData.get("price")) updateData.price = parseFloat(formData.get("price"));
    if (formData.get("placeId")) updateData.placeId = formData.get("placeId");

    if (formData.get("totalSeats")) {
      const totalSeats = parseInt(formData.get("totalSeats"), 10);
      const currentTour = await Tour.findById(id);
      if (!currentTour)
        return NextResponse.json({ error: "Tour not found" }, { status: 404 });

      const bookedSeats = currentTour.totalSeats - currentTour.availableSeats;
      updateData.totalSeats = totalSeats;
      updateData.availableSeats = Math.max(0, totalSeats - bookedSeats);
    }

    if (formData.get("perPersonLimit")) {
      updateData.perPersonLimit = parseInt(formData.get("perPersonLimit"), 10);
    }

    // image update
    const files = formData.getAll("img");
    if (files.length > 0) {
      const currentTour = await Tour.findById(id);
      if (currentTour?.img) await deleteFromS3(currentTour.img); // delete old
      updateData.img = await uploadToS3(files[0]);
    }

    const updated = await Tour.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ ...updated._doc, img: s3Url(updated.img) }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------- DELETE --------------------
export async function DELETE(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Tour id is required" }, { status: 400 });

    const tour = await Tour.findById(id);
    if (tour?.img) await deleteFromS3(tour.img);

    await Tour.findByIdAndDelete(id);
    return NextResponse.json({ message: "Tour deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
