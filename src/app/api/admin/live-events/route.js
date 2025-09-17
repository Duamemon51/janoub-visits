import connectToDB from '@/lib/mongodb';
import LiveEvent from '@/models/LiveEvent';
import mongoose from 'mongoose';
import AWS from 'aws-sdk';

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload buffer to S3
async function uploadToS3(buffer, key, contentType = 'image/jpeg') {
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: contentType };
  await s3.upload(params).promise();
  return key;
}

// Delete object from S3
async function deleteFromS3(key) {
  if (!key) return;
  try {
    await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }).promise();
    console.log(`Deleted S3 object: ${key}`);
  } catch (err) {
    console.error('Error deleting S3 object:', err);
  }
}

// GET all events
export async function GET() {
  await connectToDB();
  const events = await LiveEvent.find();

  const eventsWithBookings = events.map(ev => {
    const bookedSeats = ev.totalSeats - ev.availableSeats;
    const remainingSeats = ev.availableSeats;
    const imgUrl = ev.img ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${ev.img}` : '';

    return { ...ev._doc, bookedSeats, remainingSeats, img: imgUrl };
  });

  return new Response(JSON.stringify(eventsWithBookings), { status: 200 });
}

// POST create event
export async function POST(req) {
  await connectToDB();
  const formData = await req.formData();
  const title = formData.get('title');
  const dateFrom = formData.get('dateFrom');
  const dateTo = formData.get('dateTo');
  const location = formData.get('location');
  const price = formData.get('price');
  const btn = formData.get('btn');
  const placeId = formData.get('placeId');
  const status = formData.get('status') || 'active';
  const totalSeats = parseInt(formData.get('totalSeats')) || 0;
  const perPersonLimit = parseInt(formData.get('perPersonLimit')) || 1;
  const imgFile = formData.get('img');

  let imgKey = '';
  if (imgFile?.size > 0) {
    const buffer = Buffer.from(await imgFile.arrayBuffer());
    imgKey = await uploadToS3(buffer, `events/${Date.now()}-${imgFile.name}`, imgFile.type);
  }

  const event = await LiveEvent.create({
    title, dateFrom, dateTo, location, price, btn, img: imgKey,
    placeId, status, totalSeats, availableSeats: totalSeats, perPersonLimit
  });

  const result = event.toObject();
  if (result.img) {
    result.img = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.img}`;
  }

  return new Response(JSON.stringify(result), { status: 201 });
}

// PUT update event
export async function PUT(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Event ID is required' }), { status: 400 });

  const formData = await req.formData();
  const title = formData.get('title');
  const dateFrom = formData.get('dateFrom');
  const dateTo = formData.get('dateTo');
  const location = formData.get('location');
  const price = formData.get('price');
  const btn = formData.get('btn');
  const placeId = formData.get('placeId');
  const status = formData.get('status');
  const totalSeats = formData.get('totalSeats') ? parseInt(formData.get('totalSeats')) : undefined;
  const perPersonLimit = formData.get('perPersonLimit') ? parseInt(formData.get('perPersonLimit')) : undefined;
  const imgFile = formData.get('img');

  const currentEvent = await LiveEvent.findById(id);
  if (!currentEvent) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });

  const updateData = {};
  if (title) updateData.title = title;
  if (dateFrom) updateData.dateFrom = dateFrom;
  if (dateTo) updateData.dateTo = dateTo;
  if (location) updateData.location = location;
  if (price) updateData.price = price;
  if (btn) updateData.btn = btn;
  if (status) updateData.status = status;
  if (perPersonLimit !== undefined) updateData.perPersonLimit = perPersonLimit;

  if (placeId && placeId.trim() !== '' && mongoose.Types.ObjectId.isValid(placeId)) {
    updateData.placeId = placeId;
  }

  if (totalSeats !== undefined) {
    const bookedSeats = currentEvent.totalSeats - currentEvent.availableSeats;
    updateData.totalSeats = totalSeats;
    updateData.availableSeats = Math.max(0, totalSeats - bookedSeats);
  }

  if (imgFile?.size > 0) {
    if (currentEvent.img) await deleteFromS3(currentEvent.img);
    const buffer = Buffer.from(await imgFile.arrayBuffer());
    updateData.img = await uploadToS3(buffer, `events/${Date.now()}-${imgFile.name}`, imgFile.type);
  }

  const updated = await LiveEvent.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) return new Response(JSON.stringify({ error: 'Failed to update event' }), { status: 500 });

  const result = updated.toObject();
  if (result.img) {
    result.img = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.img}`;
  }

  return new Response(JSON.stringify(result), { status: 200 });
}

// DELETE event
export async function DELETE(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const event = await LiveEvent.findById(id);
  if (!event) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });

  if (event.img) await deleteFromS3(event.img);
  await LiveEvent.findByIdAndDelete(id);

  return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 });
}
