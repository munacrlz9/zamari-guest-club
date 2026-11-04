# Zamari Guest Club — starter

A separate guest membership portal for Zamari Suites. This is the first foundation build, not a production launch.

## Free-start stack
- Static frontend: Cloudflare Pages
- Code repository: GitHub
- Authentication + Postgres database: Supabase Free

Cloudflare Pages currently lists a free tier with 500 builds/month and static asset hosting. Supabase Free currently includes 500 MB database and 1 GB file storage; projects may pause after one week of inactivity. Check provider terms and quotas before a public business launch.

## 1. Create Supabase project
1. Create a free account at https://supabase.com
2. Create a project named `zamari-guest-club`.
3. Open SQL Editor and run `supabase/schema.sql`.
4. Open Project Settings → API and copy the Project URL and publishable (anon) key.

## 2. Connect the frontend
Open `app.js` and fill in:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Only the public anon/publishable key belongs in frontend code. Never paste a service-role key into this project or a public repository.

## 3. Preview locally
Open `index.html` in a browser. Until Supabase is configured, it runs in preview mode and does not save real accounts or feedback.

## 4. Deploy
1. Create a new GitHub repository named `zamari-guest-club`.
2. Upload the project files.
3. In Cloudflare Dashboard, open Workers & Pages → Create → Pages → Connect to Git.
4. Select the repository. Framework preset: None. Build command: leave blank. Build output directory: `/`.
5. Deploy.

## Important before real guest launch
- Configure Supabase Auth email confirmation and allowed redirect URLs.
- Review and test all RLS policies.
- Add admin roles and server-side admin workflows; do not rely on hidden buttons or client-side role checks.
- Build secure, transaction-safe reward issuance and redemption before accepting vouchers.
- Add privacy notice, consent, retention and moderation rules.
- Do not collect sensitive guest data that the platform does not need.

## First release scope
- Account creation and sign-in
- Guest dashboard
- Feedback submission
- Credits display
- Reward milestone preview

Guest wall, media uploads, admin dashboard, leaderboard, prize draws and Zuri assistant are planned for later phases.
