// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    ContextPointAggregation: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6cax4c5zkmbzbaxakcl34kg8vuiz4ozu84tls1w93xf16wyh7y91",
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6c9s96ne2cpoixts2k7beee48kleq9tnc64qx3wvadal6fimfkvz",
      accountRelation: { type: "set", fields: ["recipient", "context"] },
    },
    ContextPointAllocation: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c8r0tq8zg1zq6rxsssumgms9zmie1rrkyxpedq148zc6hgqaqr9",
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6c8kvjarm4j9mn0p0dv66qrkcy3gbluycf2s7ruktlznevnfi2ss",
      accountRelation: { type: "list" },
    },
    PointsAggregationInterface: {
      interface: true,
      implements: [
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6cax4c5zkmbzbaxakcl34kg8vuiz4ozu84tls1w93xf16wyh7y91",
      accountRelation: { type: "none" },
    },
    PointsAllocationInterface: {
      interface: true,
      implements: [
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6c8r0tq8zg1zq6rxsssumgms9zmie1rrkyxpedq148zc6hgqaqr9",
      accountRelation: { type: "none" },
    },
    PointsInterface: {
      interface: true,
      implements: [],
      id: "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      accountRelation: { type: "none" },
    },
    SimplePointsAggregation: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6cax4c5zkmbzbaxakcl34kg8vuiz4ozu84tls1w93xf16wyh7y91",
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6c64srcrdodgxi6uivpkesd63v9y8pl2ye4ya7yx1mya1mqsy4bl",
      accountRelation: { type: "set", fields: ["recipient"] },
    },
    SimplePointsAllocation: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c8r0tq8zg1zq6rxsssumgms9zmie1rrkyxpedq148zc6hgqaqr9",
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6ca3na1eg57if73vujg84yjk52ri527p1rq8ddbys08k2vecl5uv",
      accountRelation: { type: "list" },
    },
    TotalPointsAggregation: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6cax4c5zkmbzbaxakcl34kg8vuiz4ozu84tls1w93xf16wyh7y91",
        "kjzl6hvfrbw6c7zf52etfo2gvkzuvmq9d1ng6vizmisjtjt54vjn5mmuisagyk3",
      ],
      id: "kjzl6hvfrbw6c8qvlsf74xlm1lit9f7axl3yla41ba5qf2fu8un9dbtjg7k6ybo",
      accountRelation: { type: "set", fields: ["recipient"] },
    },
  },
  objects: {
    ContextPointAggregation: {
      date: { type: "datetime", required: true, immutable: false },
      points: { type: "integer", required: true, immutable: false },
      context: { type: "string", required: true, immutable: true },
      recipient: { type: "did", required: true, immutable: true },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    ContextPointAllocation: {
      date: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      points: { type: "integer", required: true, immutable: false },
      context: {
        type: "string",
        required: true,
        immutable: false,
        indexed: true,
      },
      trigger: {
        type: "string",
        required: false,
        immutable: false,
        indexed: true,
      },
      recipient: {
        type: "did",
        required: true,
        immutable: false,
        indexed: true,
      },
      multiplier: {
        type: "integer",
        required: false,
        immutable: false,
        indexed: true,
      },
      subContext: {
        type: "string",
        required: false,
        immutable: false,
        indexed: true,
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    PointsAggregationInterface: {
      date: { type: "datetime", required: true, immutable: false },
      points: { type: "integer", required: true, immutable: false },
      recipient: { type: "did", required: true, immutable: false },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    PointsAllocationInterface: {
      points: { type: "integer", required: true, immutable: false },
      recipient: { type: "did", required: true, immutable: false },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    PointsInterface: {
      points: { type: "integer", required: true, immutable: false },
      recipient: { type: "did", required: true, immutable: false },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    SimplePointsAggregation: {
      date: { type: "datetime", required: true, immutable: false },
      points: { type: "integer", required: true, immutable: false },
      recipient: { type: "did", required: true, immutable: true },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    SimplePointsAllocation: {
      points: { type: "integer", required: true, immutable: false },
      recipient: { type: "did", required: true, immutable: false },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    TotalPointsAggregation: {
      date: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      points: {
        type: "integer",
        required: true,
        immutable: false,
        indexed: true,
      },
      verified: {
        type: "boolean",
        required: false,
        immutable: false,
        indexed: true,
      },
      recipient: {
        type: "did",
        required: true,
        immutable: true,
        indexed: true,
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
  },
  enums: {},
  accountData: {
    contextPointAggregation: { type: "set", name: "ContextPointAggregation" },
    contextPointAggregationList: {
      type: "connection",
      name: "ContextPointAggregation",
    },
    contextPointAllocationList: {
      type: "connection",
      name: "ContextPointAllocation",
    },
    pointsAggregationInterfaceList: {
      type: "connection",
      name: "PointsAggregationInterface",
    },
    pointsAllocationInterfaceList: {
      type: "connection",
      name: "PointsAllocationInterface",
    },
    pointsInterfaceList: { type: "connection", name: "PointsInterface" },
    recipientOfContextPointAggregation: {
      type: "account-set",
      name: "ContextPointAggregation",
      property: "recipient",
    },
    recipientOfContextPointAggregationList: {
      type: "account",
      name: "ContextPointAggregation",
      property: "recipient",
    },
    recipientOfContextPointAllocationList: {
      type: "account",
      name: "ContextPointAllocation",
      property: "recipient",
    },
    recipientOfPointsAggregationInterfaceList: {
      type: "account",
      name: "PointsAggregationInterface",
      property: "recipient",
    },
    recipientOfPointsAllocationInterfaceList: {
      type: "account",
      name: "PointsAllocationInterface",
      property: "recipient",
    },
    recipientOfPointsInterfaceList: {
      type: "account",
      name: "PointsInterface",
      property: "recipient",
    },
    recipientOfSimplePointsAggregation: {
      type: "account-set",
      name: "SimplePointsAggregation",
      property: "recipient",
    },
    recipientOfSimplePointsAggregationList: {
      type: "account",
      name: "SimplePointsAggregation",
      property: "recipient",
    },
    recipientOfSimplePointsAllocationList: {
      type: "account",
      name: "SimplePointsAllocation",
      property: "recipient",
    },
    recipientOfTotalPointsAggregation: {
      type: "account-set",
      name: "TotalPointsAggregation",
      property: "recipient",
    },
    recipientOfTotalPointsAggregationList: {
      type: "account",
      name: "TotalPointsAggregation",
      property: "recipient",
    },
    simplePointsAggregation: { type: "set", name: "SimplePointsAggregation" },
    simplePointsAggregationList: {
      type: "connection",
      name: "SimplePointsAggregation",
    },
    simplePointsAllocationList: {
      type: "connection",
      name: "SimplePointsAllocation",
    },
    totalPointsAggregation: { type: "set", name: "TotalPointsAggregation" },
    totalPointsAggregationList: {
      type: "connection",
      name: "TotalPointsAggregation",
    },
  },
};
