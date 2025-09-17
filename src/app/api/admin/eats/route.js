import connectDB from "@/lib/mongodb";
import Eats from "@/models/Eat";
import AWS from "aws-sdk";

connectDB();

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload buffer to S3
async function uploadToS3(buffer, key, contentType = "image/jpeg") {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  await s3.upload(params).promise();
  return key;
}

// Delete object from S3
async function deleteFromS3(key) {
  if (!key) return;
  try {
    await s3
      .deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
      .promise();
    console.log(`Deleted S3 object: ${key}`);
  } catch (err) {
    console.error("Error deleting S3 object:", err);
  }
}

// Helper to convert key → full URL
function s3Url(key) {
  return key
    ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    : "";
}

// GET - fetch all eats with pagination
export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await Eats.countDocuments({});

    const eats = await Eats.find({})
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name")
      .populate("placeId", "name")
      .sort({ createdAt: -1 });

    const eatsWithUrls = eats.map((eat) => {
      const obj = eat.toObject();
      if (obj.images && obj.images.length) {
        obj.images = obj.images.map((key) => s3Url(key));
      }
      return obj;
    });

    return new Response(
      JSON.stringify({ success: true, eats: eatsWithUrls, totalItems }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

// POST - create new eat
export async function POST(req) {
  try {
    const formData = await req.formData();
    const body = {};
    const images = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const keyName = `eats/${Date.now()}-${value.name}`;
        const imgKey = await uploadToS3(buffer, keyName, value.type);
        images.push(imgKey);
      } else {
        if (["totalSeats", "perPersonLimit", "price"].includes(key)) {
          body[key] = Number(value);
        } else {
          body[key] = value;
        }
      }
    }

    body.images = images;
    body.availableSeats = body.totalSeats || 0;

    const newEat = new Eats(body);
    await newEat.save();

    const result = newEat.toObject();
    if (result.images && result.images.length) {
      result.images = result.images.map((key) => s3Url(key));
    }

    return new Response(
      JSON.stringify({ success: true, eat: result }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

// PUT - update eat
export async function PUT(req) {
  try {
    const formData = await req.formData();
    const body = {};
    const newImages = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const keyName = `eats/${Date.now()}-${value.name}`;
        const imgKey = await uploadToS3(buffer, keyName, value.type);
        newImages.push(imgKey);
      } else {
        if (["totalSeats", "perPersonLimit", "price"].includes(key)) {
          body[key] = Number(value);
        } else {
          body[key] = value;
        }
      }
    }

    const { id, ...updateData } = body;
    if (!id)
      return new Response(
        JSON.stringify({ success: false, error: "ID is required" }),
        { status: 400 }
      );

    const eat = await Eats.findById(id);
    if (!eat)
      return new Response(
        JSON.stringify({ success: false, error: "Eat item not found" }),
        { status: 404 }
      );

    // Adjust availableSeats if totalSeats changed
    if (updateData.totalSeats !== undefined) {
      const diff = updateData.totalSeats - eat.totalSeats;
      eat.availableSeats += diff;
    }

    // Replace images if new uploaded
    if (newImages.length > 0) {
      if (eat.images && eat.images.length) {
        for (const oldKey of eat.images) {
          await deleteFromS3(oldKey);
        }
      }
      eat.images = newImages;
    }

    Object.assign(eat, updateData);
    await eat.save();

    const result = eat.toObject();
    if (result.images && result.images.length) {
      result.images = result.images.map((key) => s3Url(key));
    }

    return new Response(JSON.stringify({ success: true, eat: result }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

// DELETE - delete eat
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id)
      return new Response(
        JSON.stringify({ success: false, error: "ID is required" }),
        { status: 400 }
      );

    const eat = await Eats.findById(id);
    if (!eat)
      return new Response(
        JSON.stringify({ success: false, error: "Eat not found" }),
        { status: 404 }
      );

    if (eat.images && eat.images.length) {
      for (const key of eat.images) {
        await deleteFromS3(key);
      }
    }

    await Eats.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
