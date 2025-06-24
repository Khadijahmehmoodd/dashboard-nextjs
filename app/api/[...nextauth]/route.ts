// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';

export const GET = handlers.GET as typeof handlers.GET;
export const POST = handlers.POST as typeof handlers.POST;

