import { userTicketController } from "@/backend/modules/tickets/controller";
export async function GET(request: Request, context: { params: Promise<{ number: string }> }) { return userTicketController(request, context.params); }
export async function POST(request: Request, context: { params: Promise<{ number: string }> }) { return userTicketController(request, context.params); }
