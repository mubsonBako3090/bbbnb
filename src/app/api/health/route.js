// app/api/health/route.js
export async function GET() {
  try {
    await connectDB();
    return Response.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy', 
      error: error.message 
    }, { status: 500 });
  }
}