import { handleRetiredRequest } from "../../lib/retired";

export const dynamic = "force-dynamic";

export function GET(request: Request) { return handleRetiredRequest(request); }
export function HEAD(request: Request) { return handleRetiredRequest(request); }
