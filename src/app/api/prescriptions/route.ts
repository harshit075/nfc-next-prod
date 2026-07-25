import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import patientService from '@/services/patientService';
import { authenticate } from '@/lib/middleware/auth';

export const GET = wrapApi(async (req: NextRequest) => {
  const user = authenticate(req);
  const patient = await patientService.getProfileByUserId(user.userId);
  const prescriptions = await patientService.getActivePrescriptions(patient._id.toString());
  return NextResponse.json({
    success: true,
    message: 'Prescriptions retrieved',
    data: prescriptions,
  });
});
