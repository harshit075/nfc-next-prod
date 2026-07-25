import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';

export const GET = wrapApi(async (req: NextRequest) => {
  return NextResponse.json({
    success: true,
    message: 'SwasthyaTap NFC API service is healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});
