import connectDB from '@/lib/database';

export async function GET() {
  try {
    await connectDB();
    return new Response(JSON.stringify({ ok: true, db: 'connected' }), { status: 200 });
  } catch (error) {
    console.error('Health check DB error:', error);
    return new Response(JSON.stringify({ ok: false, db: 'disconnected', error: String(error) }), { status: 500 });
  }
}
