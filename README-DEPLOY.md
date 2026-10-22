# TodayService — Deployment and accuracy checklist

## Upload
1. Upload the full folder contents to your existing GitHub Pages repository root, preserving `index.html`, `booking.html`, `assets/`, `CNAME`, `robots.txt` and `sitemap.xml`. You do not need the `.git` folder from the original ZIP.
2. Your existing Apps Script URL is kept unchanged in **both** the booking form and home page. This update does not require changing the published Apps Script just to continue receiving **Front Load / Top Load** enquiries.
3. `Code.gs` now validates only `Front Load` or `Top Load` for any future Apps Script deployment. The live deployment is not automatically updated when this file is changed. To apply the stricter validation, redeploy **Manage deployments > Edit > New version**, confirm the same `/exec` URL works, and test a booking.
4. After upload, visit each new page from `sitemap.xml`, test navigation on phone and desktop, and submit **one legitimate test booking** to verify the Sheet, email and on-screen confirmation.
5. Google Search Console: use `https://todayservice.in/sitemap.xml` after the public site is live.

## Booking logic (fast experience preserved)
- The status popup appears after around **2.6 seconds**. The website immediately says `Request sent` or `Submitting` instead of making an unsupported appointment promise.
- It then checks the actual Apps Script receipt **without delaying the popup**. The UI shows a real server reference if found.
- Google Ads `generate_lead` is fired **only when the server confirms** an enquiry was saved. This prevents false conversion events.
- If the network fails, the UI warns the customer. If receipt cannot be verified, it says confirmation is pending; it does **not** claim a visit is booked.
- Apps Script `doGet` is already present and supports the receipt endpoint. Re-deploy `Code.gs` only if the deployed version has not included that endpoint.

## Business accuracy — check before advertising
- Site says TodayService **has its own technicians**; this is based on the owner's statement. Ensure it remains factually true.
- Site uses **TodayService** as the public business name. Add your genuine legal entity/proprietor name and verifiable operating location where required once you have confirmed the details. Do not invent an office, registration, GST number, experience claim, customer reviews or authorisations.
- Confirm actual supported brands/models and only advertise services that can be delivered.
- There are **no invented fixed visit charges, free inspections, specific warranty durations or response-time guarantees**. Confirm those conditions with customers before an appointment.
- Privacy Policy reflects the currently inspected Google Apps Script + Google Sheets/email data flow. Review it if adding analytics, cookies, chat widgets, payment gateways or new third-party services.
- Google Ads reinstatement is **not guaranteed**, and policy eligibility may depend on Google's separate rules for third-party technical support. Do not create a replacement Google Ads account to evade a suspension.
