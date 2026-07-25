import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import patientService from '@/services/patientService';
import { authenticate } from '@/lib/middleware/auth';

export const GET = wrapApi(async (req: NextRequest) => {
  const user = authenticate(req);
  const patient = await patientService.getProfileByUserId(user.userId);

  // Extract query filters
  const { searchParams } = req.nextUrl;
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  const reports = await patientService.getReports(patient._id.toString(), filters);

  return NextResponse.json({
    success: true,
    message: 'Reports retrieved',
    data: reports,
  });
});
