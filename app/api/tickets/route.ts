import { createTicketController, userTicketsController } from "@/backend/modules/tickets/controller";
export const GET = userTicketsController;
export const POST = createTicketController;
