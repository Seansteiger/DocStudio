import { AnyDocumentData } from './document';

export interface VaultDocument {
  id: string;
  toolId: string;
  title: string;
  subtitle: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: 'draft' | 'final' | 'archived';
  tags: string[];
  templateId: string;
  data: AnyDocumentData;
  atsScore?: number;
}

export interface VaultSnapshot {
  id: string;
  documentId: string;
  timestamp: string;
  label: string;
  data: AnyDocumentData;
}
