import { getCurrentActor } from "@/lib/auth/session";
import { documentErrorResponse, pdfResponse } from "@/server/documents/document-response";
import { documentService } from "@/server/services/document-service-instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await context.params;
    return pdfResponse(await documentService.generateHandoverProtocol(await getCurrentActor(), id));
  } catch (error) {
    return documentErrorResponse(error);
  }
}
