// src/lib/types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Paper {
  id: string;
  title: string;
  slug: string;
  description: string;
  abstract: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  publicationDate: string;
  authorName: string;
  category?: Category | null;
  tags: Tag[];
  views: number;
  downloads: number;
  aiSummary?: string | null;
  debateRoom?: { id: string } | null;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  category?: Category | null;
  tags: Tag[];
  views: number;
  likes: number;
  debateRoom?: { id: string } | null;
  createdAt: string;
}

export interface Audio {
  id: string;
  title: string;
  slug: string;
  description: string;
  fileUrl: string;
  durationSec?: number | null;
  category?: Category | null;
  tags: Tag[];
  plays: number;
  downloads: number;
  debateRoom?: { id: string } | null;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category?: Category | null;
  tags: Tag[];
  views: number;
  downloads: number;
  debateRoom?: { id: string } | null;
  createdAt: string;
}

export type DebateCategory = "SUPPORT" | "OPPOSITION" | "QUESTION" | "ALTERNATIVE_THEORY";

export interface DebateAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
}

export interface DebateComment {
  id: string;
  authorName: string;
  content: string;
  category: DebateCategory;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  createdAt: string;
  attachments: DebateAttachment[];
  replies?: DebateComment[];
  parentId?: string | null;
}

export interface DebateRoom {
  id: string;
  contentType: "PAPER" | "VIDEO" | "AUDIO" | "DOCUMENT";
  paper?: { title: string; slug: string } | null;
  video?: { title: string; slug: string } | null;
  audio?: { title: string; slug: string } | null;
  document?: { title: string; slug: string } | null;
  _count?: { comments: number; participants: number };
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
