import { adminTicketController } from "@/backend/modules/tickets/controller";
export async function GET(request: Request, context: { params: Promise<{ number: string }> }) { return adminTicketController(request, context.params); }
export async function POST(request: Request, context: { params: Promise<{ number: string }> }) { return adminTicketController(request, context.params); }
export async function PATCH(request: Request, context: { params: Promise<{ number: string }> }) { return adminTicketController(request, context.params); }
