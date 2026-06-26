import { PrismaDocumentRepository } from "@/server/repositories/document-repository";
import { DocumentService } from "@/server/services/document-service";

export const documentService = new DocumentService(new PrismaDocumentRepository());
