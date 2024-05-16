# Points System 

A NextJS application designed for:

1. Enabling a frontend to display points leaderboards and individual account statistics, as well as serve as the entrypoint for various point-related missions and quests
2. A collection of backend services responsible for:
- Serving data to the frontend
- Performing periodic chron jobs to pull raw data from disparate sources and transform them into points written to Ceramic
- Receive requests from external triggers (such as Sandboxes and other locations where eligible point activity occurs) and transform those requests into points written to Ceramic
- Create a secondary backup to Postgres
- Periodically perform diffs and subsequent patches on input data to account for failed writes or changes to original input data

The backend services are located in the [utils](./src/utils/) directory, and many of them are exposed to the frontend in the [api](./src/pages/api/) directory. Chron job APIs are in the [chron](./src/pages/api/chron/) directory.


## Dependencies

Please refer to the [.env.example](.env.example) file for all of the required and optional dependencies you will need to account for.

You will also need to create tables using specific definitions relevant to this application for your Postgres data backup. We've created a [table](./src/pages/api/table.ts) API route that you can uncomment and use directly once you have your Postgres connection string.

## Getting Started

1. Install your dependencies:

```bash
npm install
```

2. Clone the .env.example file and rename it .env. Populate this file with the necessary credentials from the dependencies this application will be using

3. Run the application in development

```bash
npm run dev
```

## License

Dual licensed under MIT and Apache 2