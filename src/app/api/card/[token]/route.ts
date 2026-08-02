import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import nfcService from '@/services/nfcService';
import mongoose from 'mongoose';

export const GET = wrapApi(async (req: NextRequest, context: { params: Promise<{ token: string }> }) => {
  const { token } = await context.params;
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || undefined;

  try {
    const result = await nfcService.validateAndResolveCard(token, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: 'NFC card validated successfully',
      data: result.patient,
    });
  } catch (error: any) {
    const dbName = mongoose.connection?.name || 'none';
    const Citizen = mongoose.models.Citizen || mongoose.model('Citizen');
    const NFCCard = mongoose.models.NFCCard || mongoose.model('NFCCard');
    
    let citizenCount = 0;
    let cardCount = 0;
    try {
      citizenCount = await Citizen.countDocuments();
      cardCount = await NFCCard.countDocuments();
    } catch (dbErr) {}

    return NextResponse.json({
      success: false,
      message: error.message || 'Profile not found',
      diagnostics: {
        dbName,
        citizenCount,
        cardCount,
        tokenLength: token?.length || 0,
        envDbName: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop()?.split('?')[0] : 'not_set',
      }
    }, { status: error.statusCode || 404 });
  }
});
