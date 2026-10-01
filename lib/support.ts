export const supportConfig = {
  consultationUrl: process.env.NEXT_PUBLIC_SUPPORT_CONSULTATION_URL?.trim() || "",
  ticketUrl: process.env.NEXT_PUBLIC_SUPPORT_TICKET_URL?.trim() || "",
} as const;
