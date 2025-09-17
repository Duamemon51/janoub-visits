import connectToDB from '@/lib/mongodb';
import LiveEvent from '@/models/LiveEvent';

export async function GET() {
  await connectToDB();

  try {
    // Fetch only active events
    const events = await LiveEvent.find({ status: 'active' });

    // Map events with bookedSeats, remainingSeats, and S3 image URLs
    const eventsWithBookings = events.map(ev => {
      const bookedSeats = ev.totalSeats - ev.availableSeats;
      const remainingSeats = ev.availableSeats;

      // Convert S3 key to full URL
      const imgUrl = ev.img 
        ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${ev.img}`
        : '';

      return {
        ...ev._doc,
        bookedSeats,
        remainingSeats,
        img: imgUrl,
      };
    });

    return new Response(JSON.stringify(eventsWithBookings), { status: 200 });
  } catch (err) {
    console.error('Failed to fetch active events:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch active events' }),
      { status: 500 }
    );
  }
}
