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

export interface FooterLink {
  href: string;
  label: string;
};

export interface SinglePointsRequest {
  recipient: string;
  amount: number;
  context: string;
  multiplier?: number;
  subContext?: string;
  trigger?: string;
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

export interface TotalAggregationWorkerInput {
  recipient: string;
  amount: number;
  verified?: boolean | null;
  date?: string;
  points?: number;
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
  subContext?: string;
  trigger?: string;
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
  subContext?: string;
  trigger?: string;
}

export interface RecipientScore {
  recipient: string;
  score: number;
  context: string;
  multiplier?: number;
  amount?: number;
  subContext?: string;
  trigger?: string;
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

type RichTextAnnotation = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
};

type RichTextContent = {
  type: string;
  text: {
    content: string;
    link: string | null;
  };
  annotations: RichTextAnnotation;
  plain_text: string;
  href: string | null;
};

type SelectOption = {
  id: string;
  name: string;
  color: string;
};

type DateType = {
  start: string;
  end: string | null;
  time_zone: string | null;
};

export interface Property {
  id: string;
  type: string;
  select?: SelectOption;
  rich_text?: RichTextContent[];
  date?: DateType;
  checkbox?: boolean;
  url?: string | null;
  title?: RichTextContent[];
  number?: number;
}

export interface NotionFeedbackType {
  Categories: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Wallet: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Email: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Experience: {
    id: string;
    type: string;
    number: number;
  };
  Feedback: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Participation: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Helpful: {
    checkbox: boolean;
  };
}

export interface NotionFeedbackEntry {
  Categories: {
    rich_text: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
  Wallet: {
    rich_text: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
  Email: {
    rich_text: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
  Experience: {
    number: number;
  };
  Feedback: {
    rich_text: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
  Participation: {
    title: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
}

export interface ObjectType {
  Difficulty: {
    id: string;
    type: string;
    select: SelectOption;
  };
  Description: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  Season: {
    id: string;
    type: string;
    select: SelectOption;
  };
  Start: {
    id: string;
    type: string;
    date: DateType | null;
  };
  Active: {
    id: string;
    type: string;
    checkbox: boolean;
  };
  Persona: {
    id: string;
    type: string;
    select: SelectOption;
  };
  Duration: {
    id: string;
    type: string;
    select: SelectOption;
  };
  Points: {
    id: string;
    type: string;
    rich_text: RichTextContent[];
  };
  URL: {
    id: string;
    type: string;
    url: string | null;
  };
  Featured: {
    id: string;
    type: string;
    checkbox: boolean;
  };
  Frequency: {
    id: string;
    type: string;
    select: SelectOption;
  };
  Name: {
    id: string;
    type: string;
    title: RichTextContent[];
  };
  Order: Property;
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  points: string;
  tags: string[];
  startdate: string;
  featured: boolean;
  active: boolean;
}

export interface PgMission {
  id: number;
  name: string;
  description: string;
  points: string;
  difficulty: string;
  persona: string;
  duration: string;
  frequency: string;
  season: string;
  startdate: string;
  active: boolean;
  featured: boolean;
  url?: string;
}

export interface XLikesResponse {
  data: {
    id: string;
    name: string;
    username: string;
  }[];
  meta: {
    result_count: number;

    next_token: string;
  };
}

export interface XTweetResponse {
  data: {
    edit_history_tweet_ids: string[];
    id: string;
    text: string;
  };
}
