import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { hashNFCToken } from '@/models/NFCCard';
import '@/models/Citizen';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const testStrings = [
      'test-token-123',
      'card-uuid-rajesh-12345',
      'x7k9m2',
      '6a66527d6a4ccc2b5f7313e5',
      '6a66527d6a4ccc2b5f7313b8',
      '8ef84cf837d08507daefd0e839c6d5d33db414baa1566355fe5bd579de12993a'
    ];

    const hashes = testStrings.reduce((acc, str) => {
      acc[str] = hashNFCToken(str);
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      hashes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
