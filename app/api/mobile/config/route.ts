// /app/api/mobile/config/route.ts
import { NextResponse, NextRequest } from "next/server";

// ضع التوكن السري في env أو هنا مؤقتاً
const SECRET = process.env.MOBILE_CONFIG_SECRET || "my-secret-token";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    apiToken: process.env.MOBILE_API_TOKEN || "demo-token-123",
    apiBaseUrl: process.env.MOBILE_API_BASE_URL || "https://api.example.com",
    allowedIPs: ["192.168.1.1", "10.0.0.2"],
    // أضف أي إعدادات أخرى تحتاجها هنا
  });
}
