# Digital Sky Solutions

I want to create a corporate website for an IT Consulting Company in Nigeria. Below are the details of the company.
==> Services
1. Software Development & Deployment
2. Business Automation
3. IT Strategy & Digital Transformation
4. Enterprise Architecture & Solution Design​‌
5. Infrastructure & Cloud Services (Local and Global)​‌
6. Cybersecurity & Risk Management​‌
7. Data & Analytics​‌
8. ERP & Enterprise Applications Solutions​‌
9. Quality Assurance & Testing​‌
10. IT Operations & DevOps

==> Products
1. AI Call Center (a conversational AI solution that helps organization call their respective target audience with a rich dashboard for response and decision making)

==> Projects
1. Digital transformation schedule - automating different processes for an organization for operational efficiency. Some applications are Staff Management (Employee profiling, Employee Performance review), Asset Management, Human Resource Management ( Leave Application, Travel Desk, or basic requests)

==> Contact
Address: Plot 4, Church Street, Magodo GRA, Lagos.
Email: info@skytlabs.com

This project was built by [Skytlabs]().


- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Copy `.env.example` to `.env.local` and set at least `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then open
http://localhost:8080/admin (or whichever port Vite prints) and sign in with them.

---

## Admin area / CMS

Everything on the public website is managed from **`/admin`** — no code changes or redeploys
are needed for routine updates.

| Area | What it does |
| --- | --- |
| **Pages & SEO** | Edit every headline, paragraph, list, card, image (+ alt text), button/CTA and icon on Home, About, Services, Products, Projects, Contact and the blog listing. Each page also has an **SEO** tab: page title, meta description, URL slug, social-sharing image, noindex, canonical override and extra JSON-LD. |
| **Header, footer & site settings** | Logos, navigation labels, header CTA, company details (address, email, phone), footer text and default SEO (site URL, default title/description/sharing image). |
| **Blog** | Create articles with a Markdown editor (toolbar + live preview), set URL, excerpt, featured image + alt text, SEO title, meta description, author and tags. Save drafts, preview, **publish now**, **schedule** for a future date/time, unpublish or delete. |
| **Enquiries** | Every contact-form submission, with status (new / in progress / closed / spam), internal notes, unread markers, reply-by-email, search and CSV export. |
| **Media library** | Upload images (JPG, PNG, WebP, GIF, AVIF, ≤ 5 MB), edit alt text, copy URLs, delete. |
| **Settings** | Contact-notification recipients, send a test email, email/spam-protection status, change your password. |
| **Users** (admins only) | Add/remove staff, reset passwords. Roles: *Administrator* (everything) and *Editor* (content, blog, media, enquiries). |

### Draft → preview → publish

Page edits are saved as a **draft**; the live site keeps showing the published version.
**Preview** opens the real page with the draft content (only visible to signed-in staff, marked
by a yellow banner). **Publish** makes it live immediately. **Discard draft** reverts to what is live.
Until a page is published from the CMS for the first time, the original launch copy is shown.

Changing a page's or article's **URL slug** automatically 301-redirects the old address and
updates navigation, internal CTAs and the sitemap.

Scheduled articles go live automatically at their publish time (checked on every request — no
cron job needed).

### SEO handled automatically

`/sitemap.xml` (pages + live articles, excluding noindex), `/robots.txt` (disallows `/admin`),
canonical URLs, Open Graph / Twitter tags, and JSON-LD for Organization, WebSite, the services
list, the blog and each article. Set **Site URL** under *Header, footer & site settings → Default
SEO* once the production domain is known so canonical and sharing URLs are absolute.

### Contact form

The form posts to the website backend (TanStack Start server function), stores the enquiry,
shows the visitor an on-page confirmation and emails the notification address(es) set in
*Admin → Settings* through the company Zoho mailbox (Reply-To is the visitor). Spam protection: hidden honeypot field, minimum
fill time, per-IP rate limit (5 per 15 min), link-heavy messages filed as spam without
notification, and optional Cloudflare Turnstile.

---

## Deployment configuration

All configuration is through environment variables — see [`.env.example`](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First run | Creates the first administrator the first time someone signs in while no users exist. |
| `SESSION_SECRET` | Recommended | Signs admin session cookies (random 32+ chars). Auto-generated and stored if omitted. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | For email | Notification email through the company Zoho mailbox (info@skytlabs.com) over SMTP. Use a Zoho app-specific password. |
| `EMAIL_FROM` | Optional | Sender shown to recipients, e.g. `SkytLabs Website <info@skytlabs.com>`; must be the Zoho mailbox or an alias. Defaults to `SMTP_USER`. |
| `CONTACT_NOTIFICATION_EMAIL` | Optional | Default recipient until one is saved in Admin → Settings (defaults to info@skytlabs.com). |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional | Enables a Cloudflare Turnstile challenge on the contact form. |

### Hosting

The site needs a host that runs a Node.js server function, plus a Postgres database
(**Neon**) for content, enquiries and users. Two hosts are set up and documented:

- **Netlify (free plan, which allows commercial use): [docs/DEPLOYMENT-NETLIFY.md](docs/DEPLOYMENT-NETLIFY.md)**.
  Uploaded images are stored in Neon and cached by Netlify's CDN.
- **Vercel (Pro plan; Hobby is non-commercial only): [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.
  Uploaded images go to Vercel Blob.

The right build output is chosen automatically from the host's build environment
(`vite.config.ts`). `netlify.toml` and `vercel.json` hold each host's build settings.

### Storage elsewhere

- **Local development**: without `DATABASE_URL`, data is written to `CMS_DATA_DIR`
  (default `.data/cms`, git-ignored). Add `DATABASE_URL`/`BLOB_READ_WRITE_TOKEN` to `.env.local`
  to develop against the real stores instead.
- **Cloudflare Workers** (the Lovable preview default): a KV namespace bound as `SKYTLABS_CMS`.

Code layout: `src/lib/cms/` (content defaults, types, server functions in `api/`, server-only
modules in `server/*.server.ts`), `src/components/pages/` (public page templates),
`src/components/admin/` (editor components), `src/routes/_site/` (public routes) and
`src/routes/admin/` (admin routes). Default copy for every page lives in
`src/lib/cms/defaults.ts`; the admin form is generated from that structure, so adding a field
there makes it editable automatically.
