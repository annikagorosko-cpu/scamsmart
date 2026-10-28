# ScamSmart – project instructions

- This project is a web app that runs on Railway, not on the developer's computer.
- The app is deployed on Railway automatically from the `main` branch of this GitHub repo.
- The database is a Railway PostgreSQL database, available only through the `DATABASE_URL` environment variable on Railway. Do not set up a local database or a local server. Never commit secrets; `.env` stays in `.gitignore`.
- Before every push run `npm run build` to make sure the app builds.
- After each finished task, commit and push to GitHub so that Railway deploys the new version.
- User interface language: Estonian. Code, comments and commit messages: English.
- Learning content lives in `content/scamsmart-content.json` and is loaded into the database by the Prisma seed script. Do not rewrite the content in code.
