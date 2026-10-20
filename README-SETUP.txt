TODAYSERVICE.IN — GITHUB PAGES WEBSITE + GOOGLE SHEETS / GMAIL LEADS

FILES
  index.html                   Home page, SEO content and booking form (CSS+JS embedded)
  booking.html                 Dedicated booking page (CSS+JS embedded)
  Code.gs                      Google Apps Script for Sheets + Gmail notification
  assets/todayservice-logo.webp  Header logo from your selected design
  assets/todayservice-icon.webp  Matching icon
  assets/favicon.png            Browser tab icon
  assets/apple-touch-icon.png   Apple home screen icon

HOW TO SET UP GOOGLE APPS SCRIPT
1. Sign into the Google account with edit access to your spreadsheet:
   https://docs.google.com/spreadsheets/d/1otcfPImvDxMd0MEGWv878z3Cn0i228AGzABgeo0EPZY/edit
2. Visit https://script.google.com/ and create a new Apps Script project.
3. Replace all content of its Code.gs file with the supplied Code.gs.
4. Save, select setupTodayService in the function dropdown and click Run.
   Approve permissions for Google Sheets and sending mail. It creates a new
   tab called "TodayService Enquiries" without overwriting existing tabs.
5. Deploy > New deployment > Web app.
   Execute as: Me. Who has access: Anyone. Click Deploy and approve if asked.
6. Copy the deployment Web App URL ending in /exec (NOT the /dev editor URL).
7. In BOTH index.html and booking.html find:
   const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   Replace only the placeholder text with your actual /exec URL, keeping quotes.
8. Upload both HTML files and the assets folder to the root of your GitHub Pages
   repository (and keep Code.gs outside the public website files if desired).
9. Test a real submission from your deployed website. Check BOTH:
    - A new row in the "TodayService Enquiries" Google Sheet tab;
    - An email in todayservice942@gmail.com (also check Spam).
   The website checks the saved row via a receipt endpoint before showing success.

IMPORTANT
- The Apps Script /exec URL MUST be configured in BOTH HTML pages.
- A GitHub Pages static website cannot itself send email; Apps Script handles this.
- Never publish Google account credentials or API secrets in the HTML.
- If you edit the Apps Script code after deployment, update the deployed version:
  Deploy > Manage deployments > Edit > New version > Deploy.
- Do not show a submitted-success conversion in Google Ads until a real receipt
  is confirmed. The pages emit a 'generate_lead' dataLayer event ONLY after
  the backend confirms the saved row and email status SENT. Connecting your
  Google Ads conversion tag / Google Tag Manager is a separate configuration.
- Visitors should be shown your complete privacy policy and actual prices,
  refund/visit charge terms and service coverage before launching ads.
- Emails are sent by the account that deploys the Apps Script; the receiving
  notification inbox is todayservice942@gmail.com.
- Google Apps Script MailApp has sending quotas. Check the email-status column.
- Business phone: +91 9148104704 | WhatsApp: +91 9148104704.
- Domain used for canonical URL: https://todayservice.in/

DESIGN & CONTENT NOTES
- Brand palette: deep indigo #10103e, purple #6425bf, magenta #d9139a.
- Homepage covers front-load, top-load and semi-auto repairs, issues, brands,
  booking process, Bengaluru locations and FAQs, with local SEO metadata.
- No unsupported claims (e.g. guaranteed same-day repair, official factory
  authorisation, unverified prices or warranty) have been invented.
- Both HTML files contain their own complete CSS and JavaScript; no external
  .css or .js files are required. Logo/icon image files remain separate.
