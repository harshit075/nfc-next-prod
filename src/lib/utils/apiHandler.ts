import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AppError from '@/lib/utils/AppError';
import logger from '@/lib/utils/logger';
import { HTTP_STATUS } from '@/lib/constants/roles';

type Handler = (req: NextRequest, context: any) => Promise<Response> | Response;

/**
 * Higher-order function to wrap API Route Handlers.
 * - Ensures DB connection is established.
 * - Centralizes try/catch error handling, returning clean JSON errors.
 * - Matches Express-like centralized logging.
 */
export function wrapApi(handler: Handler) {
  return async (req: NextRequest, context: any) => {
    try {
      await connectDB();
      return await handler(req, context);
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      const message = error.message || 'Internal Server Error';

      if (statusCode === HTTP_STATUS.INTERNAL_ERROR) {
        logger.error(`[500 Internal Error] Path: ${req.nextUrl.pathname} | Error: ${error.message}`, error);
      } else {
        logger.warn(`[Client/Operational Error] Path: ${req.nextUrl.pathname} | Code: ${statusCode} | Msg: ${message}`);
      }

      return NextResponse.json(
        {
          success: false,
          message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        { status: statusCode }
      );
    }
  };
}
