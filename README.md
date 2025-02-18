# pivotal tracker dump

**We loved using Pivotal Tracker for years, but as the service will soon [reach its end-of-life](https://www.pivotaltracker.com/blog/2024-09-18-end-of-life).**

This project exports your data from Pivotal Tracker to a local SQLite database, helping preserve your project data before Pivotal Tracker's discontinuation.

The exporter creates a complete snapshot of your project with these capabilities:

- [x] Memberships
- [x] Stories
- [x] Labels
- [x] Comments
- [x] File attachments (including saving files locally)

## Setup

1. Clone the repository

   ```sh
   git clone https://github.com/morenyang/pivotal-tracker-dump
   cd pivotal-tracker-dump
   ```

2. Install dependencies

   ```sh
   npm install
   ```

3. Configure environment variables

   Create a `.env` file in the project root with these configurations:

   ```.env
   # Required: Get your API token from:
   # https://www.pivotaltracker.com/profile#api
   TRACKER_TOKEN="your-pivotal-tracker-token"

   # Required: Find in Pivotal Tracker project URL
   TRACKER_PROJECT_ID="your-project-id"

   # Database file name
   DB_FILE_NAME="file:tracker_dump.db"
   ```

## Usage

Run the project:

```sh
npm run start
```

The stories will be exported to the local SQLite database file.

## Acknowledgments

- https://github.com/TanookiLabs/storyexporter

## License

This project is licensed under the MIT License.
