export interface Guilds {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[];
  permissions_new: string;
}

export interface Error {
  error: string;
}

export interface SinglePointsRequest {
  recipient: string;
  amount: number;
  context: string;
  multiplier?: number;
}

export interface NewPoints {
  contextTotal: number;
  total: number;
  allocationDoc: AllocationContent | undefined;
}

export interface Message {
  message: string;
}

export interface ScoreReferralInput extends ScoreInput {
  chron?: boolean;
}

export interface PgTotalAggregation {
  id: number;
  issuer: string;
  recipient: string;
  points: number;
  date: string;
  verified: boolean | null;
}

export interface ScoreInput {
  rows: DeformEntry[];
  startRow: number;
}

export interface AggregationContent {
  recipient: string; // DID
  points: number;
  date: string;
}

export interface ContextAggregationContent extends AggregationContent {
  context: string;
}

export interface PointsContent {
  recipient: string;
  points: number;
  date: string;
}

export interface AggTotalContent {
  node: {
  recipient: {
    id: string;
  };
  issuer: {
    id: string;
  };
  verified: boolean | null;
  date: string;
  points: number;
  id: string;
  };
}

export interface AllocationContent {
  recipient: string;
  points: number;
  context: string;
  multiplier?: number;
  date: string;
}

export interface AllocationNode {
  points: number;
  id: string;
  context: string;
  issuer: {
    id: string;
  };
  recipient: {
    id: string;
  };
  multiplier?: number;
}

export interface RecipientScore {
  recipient: string;
  score: number;
  context: string;
  multiplier?: number;
  amount?: number;
}

export interface Answer {
  field: {
    id: string;
    title: string;
    description: string;
    rawTitle: string;
    rawDescription: string;
    type: string;
    required: string;
  };
  name: string;
  value: string[] | string;
}

export interface DeformEntry {
  answers: Answer[];
  submittedAt: string;
  metadata: {
    ipAddress: string;
  };
  waitlistInfo: {
    identity: {
      email: string;
    };
    points: number;
    referralCount: number;
    referralUrl: string;
    isProcessed: boolean;
  };
}

export interface DeformResponse {
  data: DeformEntry[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface Extended extends PgTotalAggregation {
  ens?: string;
}
