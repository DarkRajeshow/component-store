export interface Component {
  _id: string;
  name: string;
  description: string;
  issueNumber?: string; // Optional - set when first revision is uploaded
  latestRevisionNumber?: string; // Optional - set when first revision is uploaded
  componentCode: string;
  createdAt: string;
  createdBy: User;
  lastUpdatedAt: string;
  lastUpdatedBy: User;
  notifyTo: User[];
  revisions: Revision[];
}

export interface Revision {
  _id: string;
  revisionNumber: string;
  issueNumber: string;
  remark: string;
  fileId: string;
  date: string;
  createdBy: User;
  component: string;
  originalFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface ComponentFilterParams {
  componentCode?: string;
  description?: string;
  search?: string;
  createdBy?: string;
  issueNumber?: string;
  latestRevisionNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 