import connectToDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import mongoose from 'mongoose';

function formatImg(imgKey) {
  if (!imgKey) return '/default.png';
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imgKey}`;
}

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);

    const tourId = searchParams.get('tour_id');
    let tours = [];

    if (tourId) {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid tour ID', tours: [] }), { status: 400 });
      }

      const tour = await Tour.findById(tourId).populate('placeId', 'name');
      if (!tour) {
        return new Response(JSON.stringify({ success: false, error: 'Tour not found', tours: [] }), { status: 404 });
      }

      const bookedSeats = tour.totalSeats - tour.availableSeats;
      const remainingSeats = tour.availableSeats;

      tours = [{
        ...tour._doc,
        bookedSeats,
        remainingSeats,
        img: formatImg(tour.img),
      }];
    } else {
      const filter = {};
      if (searchParams.get('placeId')) filter.placeId = searchParams.get('placeId');

      const allTours = await Tour.find(filter).populate('placeId', 'name');
      tours = allTours.map(tour => {
        const bookedSeats = tour.totalSeats - tour.availableSeats;
        const remainingSeats = tour.availableSeats;
        return {
          ...tour._doc,
          bookedSeats,
          remainingSeats,
          img: formatImg(tour.img),
        };
      });
    }

    return new Response(JSON.stringify({ success: true, tours }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message, tours: [] }), { status: 500 });
  }
}
