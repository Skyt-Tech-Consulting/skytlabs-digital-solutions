# Deploying the SkytLabs website to Netlify (free plan)

Step-by-step setup for hosting the website and its admin area on **Netlify's free plan**,
which permits commercial sites, with a free **Neon** Postgres database and notifications
sent through the company **Zoho** mailbox.

| Piece | Service | Cost |
| --- | --- | --- |
| Website, admin, contact form | Netlify (one serverless function + static files) | Free plan |
| Content, articles, enquiries, users, uploaded images | Neon Postgres | Free plan |
| Enquiry notification emails | Zoho Mail, info@skytlabs.com (existing) | Already paid |

> Dashboards change over time. If a label differs slightly, look for the nearest equivalent.
> The values to enter are what matter.

---

## Step 0: what you need

- Admin access to the GitHub repository `Skyt-Tech-Consulting/skytlabs-digital-solutions`.
- Sign-in for the Zoho mailbox **info@skytlabs.com**.
- Access to the **DNS settings for skytlabs.com** (for the final domain step).
- A computer with Node.js installed, used once to generate a secret (step 3).

---

## Step 1: create the database (Neon)

**Where:** <https://neon.com> (or neon.tech)

1. Sign up (free). Use a shared company email as the owner rather than a personal one.
2. Click **New Project**:
   - **Name:** `skytlabs-cms`
   - **Postgres version:** the default
   - **Cloud provider / region:** **AWS, US East (Ohio) / us-east-2**, the region Netlify's
     functions use by default, so database calls are fast.
3. Click **Create project**.
4. On the project dashboard, click **Connect**:
   - Leave the branch as **production** (or **main**), database **neondb**, and the default role.
   - Keep **Connection pooling** switched **on**.
   - Copy the connection string. It looks like
     `postgresql://neondb_owner:…@ep-…-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`.
   - This is your **`DATABASE_URL`**. Treat it like a password.

You don't need to create tables or run SQL. The website creates its own table the first time
it runs.

---

## Step 2: create a Zoho app password

**Where:** <https://accounts.zoho.com>, signed in as **info@skytlabs.com**

1. Go to **Security → App Passwords**. If you don't see it, turn on **Multi-Factor
   Authentication** first; app passwords are offered once MFA is on.
2. Click **Generate New Password**, name it `SkytLabs website`, and copy it.
   It's shown only once. This is your **`SMTP_PASSWORD`**.

Because you sign in to Zoho at **mail.zoho.com**, the SMTP server is **`smtppro.zoho.com`**.

---

## Step 3: generate a session secret

**Where:** any terminal on a computer with Node.js

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output. This is your **`SESSION_SECRET`**.

---

## Step 4: create the Netlify site

**Where:** <https://app.netlify.com>

1. Sign up or sign in (signing in with GitHub is simplest).
2. Click **Add new site → Import an existing project → GitHub**, and authorise Netlify if asked.
   If the repository isn't listed, click **Configure the Netlify app on GitHub** and grant it
   access to `skytlabs-digital-solutions`.
3. Select **skytlabs-digital-solutions**.
4. **Site configuration** screen:
   - **Branch to deploy:** `main`
   - **Build command / Publish directory:** leave them as filled in from the repository's
     `netlify.toml` (`npm run build` and `dist`). Don't change them.
5. Click **Add environment variables** (on the same screen) and add every row below. If you
   don't see that button, deploy first and add them in step 5.

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string (step 1) |
| `ADMIN_EMAIL` | The email you'll use to sign in to the admin, e.g. `webadmin@skytlabs.com` |
| `ADMIN_PASSWORD` | A long password (16+ characters), used once for the first sign-in |
| `SESSION_SECRET` | Output of step 3 |
| `SMTP_HOST` | `smtppro.zoho.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `info@skytlabs.com` |
| `SMTP_PASSWORD` | Zoho app password (step 2) |
| `EMAIL_FROM` | `SkytLabs Website <info@skytlabs.com>` |

6. Click **Deploy skytlabs-digital-solutions**. The first build takes 2–4 minutes.

---

## Step 5: check or add environment variables (if you skipped them in step 4)

**Where:** Netlify → your site → **Site configuration → Environment variables**

1. Click **Add a variable → Add a single variable** for each row in the table above.
   Leave **scopes** on *All scopes* and **deploy contexts** on *All*.
   (Mark secrets as **Contains secret values** if offered.)
2. Then go to **Deploys → Trigger deploy → Deploy site**. Variables only take effect on a new deploy.

---

## Step 6: open the site and set up the admin

**Where:** the Netlify URL shown at the top of the site overview, e.g.
`https://skytlabs-digital-solutions.netlify.app`

1. Open the URL. The website should load with the current content.
   - If it shows "This page didn't load", see [Troubleshooting](#troubleshooting).
2. Go to **`/admin`** on that URL and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
   This creates the administrator account.
3. **Settings → Change your password**: set a new password only you know.
4. **Settings → Enquiry notifications**: enter `info@skytlabs.com` → **Save** →
   **Send test email**. Check that it arrives in the Zoho inbox.
5. Open the website's **Contact** page (ideally on your phone), send a test message, and check:
   - the page shows the thank-you confirmation,
   - the email arrives in Zoho (Reply goes to the sender),
   - the message appears in **Admin → Enquiries**.
6. Back in Netlify (**Site configuration → Environment variables**), **delete `ADMIN_PASSWORD`**
   and trigger a new deploy. The admin account keeps working.

---

## Step 7: connect skytlabs.com

**Where:** Netlify → **Domain management**, then the DNS settings for skytlabs.com

### 7.1 Release the domain from the old Vercel project first

The domain is currently attached to the old **Vercel** project. In Vercel, open that project
→ **Settings → Domains** → remove `skytlabs.com` and `www.skytlabs.com`.
(Optionally pause or delete the old Vercel project afterwards so it stops deploying.)

### 7.2 Add the domain in Netlify

1. Netlify → your site → **Domain management → Add a domain** → enter `skytlabs.com` →
   **Verify** → **Add domain**. Netlify also adds `www.skytlabs.com`.
2. Netlify shows **"Awaiting External DNS"** with the records to create. Use **the exact values
   Netlify shows**. Typically:
   - `skytlabs.com`: an **A** record (or ALIAS/ANAME) pointing to Netlify's load balancer IP.
   - `www`: a **CNAME** pointing to `<your-site>.netlify.app`.
3. At your DNS provider:
   - **Delete the old Vercel A/CNAME records** for `@` and `www`, and create the Netlify ones.
   - **Do not touch MX, SPF (TXT), DKIM or other TXT records.** Those keep Zoho email working.
4. Back in Netlify, wait until the domain is verified. HTTPS (Let's Encrypt) is issued
   automatically, usually within minutes, though DNS can take longer.
5. Under **Domain management**, set the **primary domain** (e.g. `www.skytlabs.com`); the
   other then redirects to it.

### 7.3 Tell the CMS its address

**Where:** `https://www.skytlabs.com/admin` → **Pages & SEO → Header, footer & site settings →
Default SEO → Site URL**

Enter `https://www.skytlabs.com` → **Publish**. This makes canonical links, social previews
and the sitemap use the real domain.

---

## Step 8: final checks

- [ ] Every page loads on the real domain, on desktop and phone.
- [ ] Edit a heading on one page in the admin → **Save draft** → **Preview** → **Publish** →
      the live page changes. Change it back.
- [ ] Create a test blog article, publish it, view `/blog`, then delete it.
- [ ] `https://www.skytlabs.com/sitemap.xml` and `/robots.txt` load and use the real domain.
- [ ] Contact form → confirmation → email in Zoho → entry in Admin → Enquiries.
- [ ] Submit the sitemap in Google Search Console.

---

## Day-to-day

| Task | How |
| --- | --- |
| Edit pages, publish articles, read enquiries | `/admin`. No deploy needed. |
| Code changes | Push to `main`; Netlify rebuilds automatically. Content is unaffected. |
| Roll back a bad code deploy | Netlify → **Deploys** → choose an earlier deploy → **Publish deploy**. |
| Add staff | Admin → **Users**. |
| Forgotten or compromised password | On the sign-in page, click **Forgot password?** and enter your email. A link valid for 30 minutes arrives by email. Setting a new password signs out every device that was signed in. Needs email (step 2) working. |
| Back up content | Neon keeps a short restore window on the free plan. For your own copy: `pg_dump "<DATABASE_URL>" > skytlabs-backup.sql`. Export enquiries to CSV from Admin → Enquiries. |
| Watch usage | Netlify → **Usage & billing**; Neon → **Usage**. |

**Free-plan behaviour to expect:**
- **Slower first load after a quiet spell:** Neon pauses the database when idle and takes a
  moment to wake up.
- **Uploaded images are stored in the Neon database** and cached by Netlify's CDN after the
  first view. Keep uploads compressed (the limit is 4 MB each). Neon's free storage is
  ample for a typical media library.

---

## Troubleshooting

To see server errors: Netlify → your site → **Logs → Functions → server handler**.

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails during install | Install settings changed | Make sure the build command is `npm run build` and publish dir is `dist` (from `netlify.toml`). |
| "This page didn't load"; log says **"CMS storage unavailable on Netlify"** | `DATABASE_URL` missing | Add it (step 5) and trigger a deploy. |
| Log shows `password authentication failed` / connection errors | Wrong or outdated `DATABASE_URL` | Copy it again from Neon → **Connect**, update the variable, redeploy. |
| Admin sign-in says **"No administrator account exists yet"** | `ADMIN_EMAIL`/`ADMIN_PASSWORD` not set | Add them, redeploy, sign in. |
| Test email fails: **"535 Authentication Failed"** | Normal password used instead of an app password, or wrong one | Generate a new Zoho app password (step 2), update `SMTP_PASSWORD`, redeploy. |
| Error mentions **553 / relaying disallowed** | `EMAIL_FROM` isn't info@skytlabs.com | Set `EMAIL_FROM` to `SkytLabs Website <info@skytlabs.com>`, redeploy. |
| Email error mentions a **timeout** | Port blocked | Set `SMTP_PORT` to `587`, redeploy. |
| Domain still shows the old site | DNS still points at Vercel, or domain still on the Vercel project | Redo 7.1 and 7.2; DNS changes can take a few hours. |
| Company email stopped working | MX/TXT records were changed | Restore Zoho's MX/SPF/DKIM records (Zoho Mail Admin Console → Domains shows the required values). |
