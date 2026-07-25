import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import nfcService from '@/services/nfcService';

export const GET = wrapApi(async (req: NextRequest, context: { params: Promise<{ token: string }> }) => {
  const { token } = await context.params;
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || undefined;

  const result = await nfcService.validateAndResolveCard(token, ipAddress, userAgent);

  return NextResponse.json({
    success: true,
    message: 'NFC card validated successfully',
    data: result.patient,
  });
});
