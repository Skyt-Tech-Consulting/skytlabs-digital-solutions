# Deploying the SkytLabs website to Vercel

A complete, step-by-step guide for putting the website and its admin area (CMS) live on
Vercel, connecting storage and email, pointing the skytlabs.com domain at it, and checking
that everything works before handover.

> Vercel, Neon and Zoho update their dashboards from time to time. If a button label
> differs slightly from what is written here, look for the closest equivalent. The *values*
> (names of variables, settings to choose) are what matter.

---

## Contents

1. [What you need before you start](#1-what-you-need-before-you-start)
2. [Prepare your secret values](#2-prepare-your-secret-values)
3. [Create the Vercel project](#3-create-the-vercel-project)
4. [Choose the server region](#4-choose-the-server-region)
5. [Connect the database (Neon Postgres)](#5-connect-the-database-neon-postgres)
6. [Connect image storage (Vercel Blob)](#6-connect-image-storage-vercel-blob)
7. [Keep preview deployments away from live data](#7-keep-preview-deployments-away-from-live-data)
8. [Set up email notifications (Zoho Mail)](#8-set-up-email-notifications-zoho-mail)
9. [Optional: spam challenge (Cloudflare Turnstile)](#9-optional-spam-challenge-cloudflare-turnstile)
10. [Add the environment variables](#10-add-the-environment-variables)
11. [Redeploy](#11-redeploy)
12. [Connect the skytlabs.com domain](#12-connect-the-skytlabscom-domain)
13. [First sign-in and admin setup](#13-first-sign-in-and-admin-setup)
14. [Go-live checklist](#14-go-live-checklist)
15. [After launch: day-to-day operation](#15-after-launch-day-to-day-operation)
16. [Troubleshooting](#16-troubleshooting)
17. [Reference: all environment variables](#17-reference-all-environment-variables)

---

## 1. What you need before you start

| Item | Why | Notes |
| --- | --- | --- |
| Access to the GitHub repository | Vercel deploys from it | You must be able to authorise the Vercel GitHub app for this repo. |
| A **Vercel Pro** team | Hosting | Vercel's Hobby (free) plan is for personal, non-commercial use only, and a company website counts as commercial. Create the project under a Pro team. |
| Access to the **Zoho Mail** account `info@skytlabs.com` (and ideally the Zoho Mail admin) | Sends contact-form notification emails | The website sends from this mailbox over SMTP. No new email service is needed. |
| Access to **DNS for skytlabs.com** | Point the domain at Vercel | Whoever manages the domain (registrar or DNS provider). |
| *(Optional)* A Cloudflare account | Turnstile spam challenge | Only if you want the extra challenge on the contact form. |

The Neon database and the Blob store are both created from inside Vercel, so no
separate accounts are needed for those.

Allow about an hour, plus however long DNS changes take to apply (minutes to a few hours).

---

## 2. Prepare your secret values

Decide on these now and keep them in your password manager. You will paste them into Vercel
in step 10.

| Value | What to use |
| --- | --- |
| **First admin email** | The email address of the person who will own the admin area, e.g. `webadmin@skytlabs.com`. |
| **First admin password** | A long, unique password (16+ characters). It is used **once**, to create the first admin account. |
| **Session secret** | A random string of 32+ characters. Generate one with either command below. |

```sh
# Option A (macOS/Linux/Git Bash)
openssl rand -base64 32

# Option B (any machine with Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 3. Create the Vercel project

1. Sign in to <https://vercel.com> and switch to the **Pro team** that will own the site.
2. Click **Add New… → Project**.
3. Under **Import Git Repository**, find the SkytLabs repository and click **Import**.
   If it is not listed, click **Adjust GitHub App Permissions** and grant access to it.
4. On the **Configure Project** screen:
   - **Project name**: e.g. `skytlabs-website`.
   - **Framework Preset**: **Other**.
   - **Root Directory**: leave as `./`.
   - **Build and Output Settings**: leave everything as it is. The repository contains a
     `vercel.json` that sets the install command (`npm ci`) and build command
     (`npm run build`). The build writes its output to `.vercel/output`, which Vercel detects
     automatically, so leave the output directory empty.
   - **Environment Variables**: skip for now (step 10).
5. Click **Deploy**.

**What to expect:** the build succeeds, but the deployed site shows an error page. That is
correct: the site deliberately refuses to run on Vercel until a database is connected
(step 5), so that no content can ever be lost.

6. Open the project's **Settings → General** (labelled **Build and Deployment** in some
   versions of the dashboard) and set **Node.js Version** to **22.x** or **24.x**.

> **Why `vercel.json` matters:** the repository also contains an old `bun.lock` file from the
> original template. Without `vercel.json`, Vercel would install packages with Bun from that
> outdated lockfile and get the wrong library versions. Do not delete `vercel.json`.

---

## 4. Choose the server region

Vercel runs the site's server code in one region (Washington, D.C. by default). For visitors
in Nigeria, a European region is usually much closer.

1. Project **Settings → Functions → Function Region**.
2. Choose **London, UK (lhr1)** or **Frankfurt, Germany (fra1)**.
3. Save. Note which one you chose, because the database in step 5 should be in the same area.

---

## 5. Connect the database (Neon Postgres)

This database holds all page content, blog articles, enquiries, admin users and settings.
The website creates its own table (`cms_kv`) the first time it runs, so **you don't need to
run any SQL**.

1. In the Vercel project, open the **Storage** tab.
2. Click **Create Database** (or **Browse Marketplace**) and choose **Neon (Serverless
   Postgres)**. Accept the integration terms if this is your first Marketplace product.
3. Configure the database:
   - **Region**: the AWS region nearest to the function region from step 4:
     **Europe (London) / eu-west-2** for London, or **Europe (Frankfurt) / eu-central-1** for
     Frankfurt.
   - **Plan**: **Free**.
   - **Name**: `skytlabs-cms`.
4. Click **Create**, then **Connect Project** and select this project:
   - **Environments**: tick **Production** and **Development**.
   - **Preview**: see step 7 before deciding.
   - **Environment variable prefix**: leave the default (blank).
5. Check the variables were added: project **Settings → Environment Variables** should now
   list **`DATABASE_URL`**, plus others such as `DATABASE_URL_UNPOOLED` and `PG…` variables
   that the site doesn't need.

**If `DATABASE_URL` isn't there** (for example because a prefix was set): open the database
from the Storage tab → **Open in Neon** → **Connect**. Copy the connection string (it starts
with `postgresql://`) and add it yourself as `DATABASE_URL`.

**About the free plan:** Neon suspends the database after a few minutes without traffic. The
first page load after a quiet period can take a moment longer while it wakes up; after that
it's normal speed. Storage and compute allowances are listed on Neon's pricing page and are
far more than this site needs. You can see usage in the Neon console.

---

## 6. Connect image storage (Vercel Blob)

Images uploaded in the admin's media library are stored here and served from Vercel's CDN.

1. Project **Storage** tab → **Create Database** → **Blob**.
2. Configure the store:
   - **Name**: `skytlabs-media`
   - **Access**: **Public**. This matters: website images must be publicly viewable, and a
     Private store will not work for the site.
3. Click **Create**, then connect it to this project:
   - **Environments**: **Production** and **Development**.
   - Tick **"Add a read-write token env var to this connection"** (wording may vary
     slightly). Without this box ticked, Vercel does not create the `BLOB_READ_WRITE_TOKEN`
     variable the site needs.
4. Check **Settings → Environment Variables** now lists `BLOB_READ_WRITE_TOKEN`.

If the token is missing, the site still works, but images are stored inside the database
instead of the CDN, which is slower and uses up database space. To fix it, open the Blob
store's **Projects** tab, edit the project connection and tick the token option.

Uploads are limited to 4 MB per image, because Vercel rejects requests over 4.5 MB.

---

## 7. Keep preview deployments away from live data

Vercel builds a **preview** deployment for every branch and pull request. If previews used
the production database, editing content on a preview URL would change the live website.

Pick one option:

- **Option A: Neon preview branches (recommended).** When connecting Neon in step 5, also
  tick **Preview** and enable the option to **create a database branch for each preview
  deployment** (wording may vary). Neon then gives every preview its own copy of the data,
  so editing a preview never touches the live site. The free plan allows a limited number of
  branches (10 per project at the time of writing), so delete old preview branches from the
  Neon console now and then. Previews also need the step 10 variables set for **Preview**.
  Uploaded images on previews would still go to the live Blob store, so either create a
  second Public Blob store (`skytlabs-media-preview`) connected to Preview only, or avoid
  uploading images on previews.
- **Option B: no preview storage.** Don't tick Preview for Neon or Blob. Preview URLs then
  show the "storage unavailable" error page, but production data can never be touched from a
  preview. This is the simplest choice if you don't plan to use preview deployments.

---

## 8. Set up email notifications (Zoho Mail)

Each contact-form enquiry triggers an email. The website signs in to the existing Zoho
mailbox **info@skytlabs.com** over SMTP and sends the notification from it. Recipients are
set in the admin (step 13), usually info@skytlabs.com itself. Each notification's **Reply-To**
is the visitor, so pressing Reply in Zoho answers the visitor directly.

No new DNS records are needed: skytlabs.com mail is already handled by Zoho.

### 8.1 Find your Zoho SMTP server

Zoho uses a different server for each data centre. Look at the address you use to open
Zoho Mail in the browser:

| You sign in at | SMTP server (`SMTP_HOST`) |
| --- | --- |
| `mail.zoho.com` | `smtppro.zoho.com` |
| `mail.zoho.eu` | `smtppro.zoho.eu` |
| `mail.zoho.in` | `smtppro.zoho.in` |
| `mail.zoho.com.au` | `smtppro.zoho.com.au` |
| `mail.zoho.jp` | `smtppro.zoho.jp` |

Use the `smtppro.` form, because skytlabs.com is a custom-domain (organisation) account. The
`smtp.zoho.…` servers are for personal `@zoho.com` addresses. Port: **465** (SSL).

### 8.2 Create an app-specific password (recommended)

Don't give the website the mailbox's normal password. Create a separate one that only
works for this purpose and can be revoked at any time:

1. Sign in to Zoho as info@skytlabs.com and open **My Account**
   (<https://accounts.zoho.com>, or the `.eu`/`.in`/… equivalent for your data centre).
2. Go to **Security → App Passwords**. If you don't see it, turn on **Multi-Factor
   Authentication** first; app passwords are offered once MFA is enabled.
3. Click **Generate New Password**, name it `SkytLabs website`, and copy the password shown.
   It is displayed only once and becomes `SMTP_PASSWORD`.

If MFA is enabled on the mailbox, an app-specific password is **required**, and the normal
password will be rejected for SMTP.

### 8.3 Check the Zoho admin settings (only if sign-in fails)

In most organisations nothing needs changing. If the test email in step 13 fails with an
authentication error even though the password is right, ask whoever administers Zoho Mail to
open the **Zoho Mail Admin Console**, find the info@skytlabs.com user, and make sure
IMAP/POP/SMTP (external client) access isn't disabled for it.

Recommended for deliverability: in the Admin Console under **Domains → skytlabs.com**, confirm
that **SPF** and **DKIM** show as verified. This matters if notifications are also sent to
addresses outside Zoho, such as a Gmail account.

### 8.4 Values you will enter in step 10

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | From 8.1, e.g. `smtppro.zoho.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `info@skytlabs.com` |
| `SMTP_PASSWORD` | The app-specific password from 8.2 |
| `EMAIL_FROM` | `SkytLabs Website <info@skytlabs.com>` |

`EMAIL_FROM` must use **info@skytlabs.com** (the display name before it can be anything) or an
address set up as an alias of that mailbox in Zoho. Zoho refuses to send "from" any other
address.

> **Optional tidy-up in Zoho:** create a filter for subject *starts with* `New enquiry:` that
> applies a label such as **Website enquiries**, so notifications are easy to find.

---

## 9. Optional: spam challenge (Cloudflare Turnstile)

The contact form already has built-in spam protection: a hidden trap field, a minimum
fill-in time, a limit of 5 messages per visitor per 15 minutes, and automatic filing of
link-heavy messages as spam. Turnstile adds a mostly invisible "are you human" check on top.
Skip this step unless spam becomes a problem.

1. Sign in to <https://dash.cloudflare.com> (free account is fine) → **Turnstile → Add widget**.
2. **Widget name**: `SkytLabs contact form`.
3. **Hostnames**: `skytlabs.com`, `www.skytlabs.com`, and your `*.vercel.app` project domain
   (for testing).
4. **Widget mode**: **Managed**.
5. Copy the **Site Key** and **Secret Key**. They become `TURNSTILE_SITE_KEY` and
   `TURNSTILE_SECRET_KEY`.

Both keys must be set for the challenge to switch on.

---

## 10. Add the environment variables

Project **Settings → Environment Variables**. For each row below, click **Add**, enter the
name and value, choose the environments, and save. Mark secrets as **Sensitive** where the
option exists.

| Name | Value | Environments |
| --- | --- | --- |
| `ADMIN_EMAIL` | First admin email (step 2) | Production (+ Preview if using option 7A) |
| `ADMIN_PASSWORD` | First admin password (step 2) | Production (+ Preview) |
| `SESSION_SECRET` | Random secret (step 2) | Production (+ Preview, ideally a different value) |
| `SMTP_HOST` | e.g. `smtppro.zoho.com` (step 8.1) | Production (+ Preview if you want preview emails) |
| `SMTP_PORT` | `465` | Production (+ Preview) |
| `SMTP_USER` | `info@skytlabs.com` | Production (+ Preview) |
| `SMTP_PASSWORD` | Zoho app-specific password (step 8.2), mark **Sensitive** | Production (+ Preview) |
| `EMAIL_FROM` | `SkytLabs Website <info@skytlabs.com>` | Production (+ Preview) |
| `CONTACT_NOTIFICATION_EMAIL` | e.g. `info@skytlabs.com` *(optional)* | Production |
| `TURNSTILE_SITE_KEY` | *(optional, step 9)* | Production (+ Preview) |
| `TURNSTILE_SECRET_KEY` | *(optional, step 9)* | Production (+ Preview) |

`DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` were already added by steps 5 and 6. Don't add
them again.

**Notes**
- `CONTACT_NOTIFICATION_EMAIL` is only a starting value. Once someone saves recipients in
  **Admin → Settings**, the admin setting wins.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are only read while **no admin account exists**. After the
  first sign-in (step 13) they do nothing, and you should delete `ADMIN_PASSWORD`.
- Changing `SESSION_SECRET` later signs everyone out. That is harmless, and useful if you
  ever suspect a session was compromised.

---

## 11. Redeploy

Environment variables only apply to **new** deployments.

1. Open the **Deployments** tab.
2. On the latest production deployment, click **⋯ → Redeploy** and confirm.
3. When it finishes, open the deployment URL (`https://<project>.vercel.app`). The website
   should now load normally, showing the original launch content.

From now on, every push to the `main` branch redeploys automatically. Content edits made in
the admin **never** need a redeploy.

---

## 12. Connect the skytlabs.com domain

1. Project **Settings → Domains → Add Domain**.
2. Enter `skytlabs.com` and add it. When asked, also add `www.skytlabs.com` and choose which
   one is primary. The other redirects to it. A common choice is `www.skytlabs.com` as
   primary.
3. Vercel shows the DNS records to create, typically an **A** record for the apex
   (`skytlabs.com`) and a **CNAME** for `www`. **Use the exact values Vercel displays for your
   project**, because they can differ between projects.
4. At your DNS provider, create or replace **only those web records**.
   - Do **not** change MX, SPF or other TXT records. Those carry company email.
   - If you are moving the whole domain's nameservers to Vercel instead, first recreate
     every existing record (especially MX and email TXT records) in Vercel DNS, or company
     email will stop working.
5. Wait for Vercel to show the domain as **Valid Configuration**. HTTPS certificates are
   issued automatically.
6. If you used Turnstile, make sure the final hostnames are listed in the widget (step 9).

---

## 13. First sign-in and admin setup

1. Go to `https://www.skytlabs.com/admin` (or the `.vercel.app` URL if DNS isn't ready yet).
2. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. This creates the first administrator.
3. **Settings → Change your password**: set a new password known only to the admin.
4. In Vercel, **delete the `ADMIN_PASSWORD` environment variable** (and `ADMIN_EMAIL` if you
   like), then redeploy (step 11). The account keeps working; the bootstrap credentials no
   longer exist anywhere.
5. **Users → Add a user** for each marketing team member:
   - **Editor**: pages, blog, media library and enquiries.
   - **Administrator**: also manages users and notification settings.

   Send each person their temporary password through a secure channel and ask them to change
   it under **Settings** after their first sign-in.
6. **Settings → Enquiry notifications**: enter the address(es) that should receive enquiries
   (comma-separated), click **Save**, then **Send test email** and confirm it arrives.
7. **Pages & SEO → Header, footer & site settings → Default SEO → Site URL**: enter the
   primary address, e.g. `https://www.skytlabs.com`, and click **Publish**. This makes
   canonical links, social-sharing previews and the sitemap use the real domain.

---

## 14. Go-live checklist

Work through this before handover. It mirrors the completion checks in the requirements
brief. Use a test phrase you can easily find and remove afterwards.

**Content management**
- [ ] For **each** page (Home, About, Services, Products, Projects, Contact, Blog listing,
      Header/footer): change a heading, **Save draft**, **Preview** (yellow banner shows the
      draft), confirm the live page in a private window is unchanged, **Publish**, confirm
      the live page now shows the change. Then change it back and publish again.
- [ ] Replace an image through the media picker, fill in its alt text, publish, check it shows.
- [ ] Change a button label and link, publish, click it on the live site.

**SEO**
- [ ] On one page's **SEO** tab, change the title and meta description and publish. View
      the live page's source (`Ctrl+U`) and find the new `<title>` and
      `<meta name="description">`.
- [ ] Optional: change a page's URL slug, publish, and confirm the old address redirects
      to the new one. (Change it back afterwards if it was only a test.)
- [ ] `https://www.skytlabs.com/sitemap.xml` lists the pages using the real domain.
- [ ] `https://www.skytlabs.com/robots.txt` points to the sitemap and blocks `/admin`.

**Blog**
- [ ] Create an article with a featured image and alt text, SEO title and description. Save
      as draft: it must **not** appear on `/blog`.
- [ ] Preview it, then **Publish now**: it appears on `/blog` and at `/blog/<slug>`.
- [ ] **Schedule** a second article a few minutes ahead. It appears only after that time.
- [ ] Unpublish or delete the test articles.

**Contact form and enquiries**
- [ ] From a phone, submit the contact form with real contact details. The page shows the
      thank-you confirmation.
- [ ] The notification email arrives at the configured address. **Reply** goes to the
      visitor's address, and the **Open in admin** button opens the enquiry.
- [ ] The enquiry is listed in **Admin → Enquiries**; status changes and notes save.

**Responsive**
- [ ] Check Home, Services, Contact, Blog and an article on a phone and a tablet: no
      sideways scrolling, menu opens and closes.
- [ ] Sign in to the admin on a phone and edit a page.

**Search engines (after go-live)**
- [ ] Add the domain to Google Search Console and submit `https://www.skytlabs.com/sitemap.xml`.

---

## 15. After launch: day-to-day operation

| Task | How |
| --- | --- |
| Edit content, publish articles, read enquiries | In `/admin`. No developer or redeploy needed. |
| Ship code changes | Merge to `main`; Vercel deploys automatically. Content is unaffected. |
| Roll back a bad code deploy | Vercel **Deployments** → pick the previous good deployment → **⋯ → Promote to Production** (called **Instant Rollback** in some dashboards). Content is unaffected because it lives in the database. |
| Add or remove staff | Admin → **Users** (administrators only). |
| Forgotten password | Another administrator resets it in **Users**. If the only administrator is locked out, contact the developer. |
| Change who gets enquiries | Admin → **Settings → Enquiry notifications**. |
| Back up content | Neon keeps a short restore window on the free plan (see Neon's **Backup & Restore** page for the current window). For your own copies, run `pg_dump "$DATABASE_URL" > skytlabs-backup.sql` from any machine with PostgreSQL tools, and export enquiries to CSV from Admin → Enquiries regularly. |
| Watch usage and costs | Vercel **Usage** tab and the Neon console (**Usage**). Enable spend alerts on the Pro team. |
| Rotate secrets | Generate a new Zoho app-specific password (or Turnstile keys, or a new `SESSION_SECRET`), update it in Vercel, redeploy, then revoke the old one. |
| info@ mailbox password changed | Nothing to do: app-specific passwords keep working when the normal password changes. They stop only when revoked, or if MFA is reset. |

**Developing locally against the real stores** (developers only): install the Vercel CLI,
run `vercel link` in the repo, then `vercel env pull .env.local`. This pulls the Development
values from steps 5 and 6, including `DATABASE_URL`. Without them, local development stores data in `.data/cms`.

---

## 16. Troubleshooting

To see server errors, open the project in Vercel → **Logs** (or open the failing deployment
and view its **Runtime Logs**).

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Build fails during the install step, or mentions `bun` | `vercel.json` missing or overridden | Make sure `vercel.json` is in the repo and the project's install command isn't overridden in Settings. |
| Site shows "This page didn't load"; logs say **"CMS storage unavailable on Vercel"** | Neon not connected to this environment, or not redeployed since | Do step 5 (check the environment ticks), then redeploy. |
| Logs show `password authentication failed` or `getaddrinfo`/connection errors from Neon | `DATABASE_URL` is wrong or out of date (e.g. the password was reset in Neon) | Copy the connection string again from Neon → **Connect**, update `DATABASE_URL`, then redeploy. |
| First page load after a quiet period is slow | Free-plan database waking up | Expected; later loads are fast. |
| Sign-in says **"No administrator account exists yet"** | `ADMIN_EMAIL`/`ADMIN_PASSWORD` not set for this environment | Add them for the right environment (step 10), then redeploy. |
| Sign-in with `ADMIN_PASSWORD` says incorrect password | An admin account already exists, so bootstrap variables are ignored | Sign in with that account's own password, or have another administrator reset it. |
| Dashboard warns **"Email notifications are not configured"** | `SMTP_HOST`, `SMTP_USER` or `SMTP_PASSWORD` missing | Add them (step 10), then redeploy. |
| Test email or enquiry shows **"Invalid login: 535 Authentication Failed"** | Wrong password; normal password used while MFA is on; server for the wrong data centre; or SMTP access disabled for the user | Generate a fresh app-specific password (8.2); check `SMTP_HOST` matches your data centre (8.1); see 8.3. Redeploy after changing variables. |
| Error mentions **553**, "relaying disallowed" or "sender not allowed" | `EMAIL_FROM` isn't info@skytlabs.com or one of its aliases | Set `EMAIL_FROM` to `SkytLabs Website <info@skytlabs.com>` and redeploy. |
| Error mentions a **timeout** or connection failure | Wrong host or port | Use `smtppro.zoho.…` with port `465`. If 465 is blocked, try `587`. |
| Notifications land in spam (outside Zoho) | SPF/DKIM not verified for skytlabs.com in Zoho | Step 8.3: verify SPF and DKIM in the Zoho Admin Console; consider adding a DMARC record. |
| Uploading an image fails | File over 4 MB, or not JPG/PNG/WebP/GIF/AVIF | Resize or compress the image and try again. |
| Uploaded images work, but their URLs are `/media/…` instead of `…blob.vercel-storage.com` | `BLOB_READ_WRITE_TOKEN` missing | Step 6.3: tick the read-write token option, then redeploy. Earlier uploads keep working. |
| Every image upload fails with an access/permission error | Blob store was created as **Private** | Create a new **Public** store, connect it (with the token option ticked), disconnect the private one, and redeploy. |
| Turnstile box never appears or always fails | Only one key set, or hostname not listed in the widget | Set both keys; add the hostname in Cloudflare (step 9). |
| Content edited on a preview URL appeared on the live site | Preview environment connected to the production database | Follow step 7 (option A or B). |
| Canonical/sharing links show `vercel.app` | Site URL not set | Step 13.7. |

---

## 17. Reference: all environment variables

| Variable | Required | Set by | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** on Vercel | Neon integration (step 5) | Neon Postgres connection string. `POSTGRES_URL` is also accepted. |
| `BLOB_READ_WRITE_TOKEN` | Strongly recommended | Blob connection (step 6) | Stores uploaded images on Vercel's CDN. |
| `ADMIN_EMAIL` | First deploy only | You (step 10) | Email of the first administrator. |
| `ADMIN_PASSWORD` | First deploy only | You (step 10) | Password of the first administrator. Delete after step 13. |
| `SESSION_SECRET` | Recommended | You (step 10) | Signs admin sign-in cookies. If omitted, one is generated and stored in the database. |
| `SMTP_HOST` | For email | You (step 10) | Zoho SMTP server, e.g. `smtppro.zoho.com`. |
| `SMTP_PORT` | For email | You (step 10) | `465` (SSL) or `587` (STARTTLS). Default `465`. |
| `SMTP_USER` | For email | You (step 10) | Mailbox the site signs in as: `info@skytlabs.com`. |
| `SMTP_PASSWORD` | For email | You (step 10) | Zoho app-specific password. |
| `EMAIL_FROM` | Optional | You (step 10) | Sender shown to recipients, e.g. `SkytLabs Website <info@skytlabs.com>`. Defaults to `SMTP_USER`. |
| `RESEND_API_KEY` | Not used with Zoho | — | Alternative provider (Resend). Ignored whenever the SMTP variables are set. |
| `CONTACT_NOTIFICATION_EMAIL` | Optional | You (step 10) | Starting recipient until one is saved in Admin → Settings. Default `info@skytlabs.com`. |
| `TURNSTILE_SITE_KEY` | Optional | You (step 10) | Turnstile public key (both keys needed). |
| `TURNSTILE_SECRET_KEY` | Optional | You (step 10) | Turnstile secret key. |
| `CMS_DATA_DIR` | Local dev only | Developer | Folder for local data when no database is configured (default `.data/cms`). Ignored on Vercel. |
| `VERCEL` | Automatic | Vercel | Tells the build to produce Vercel output. Do not set manually. |
