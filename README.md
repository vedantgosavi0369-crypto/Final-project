# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

## Backend Configuration

The backend now handles an OTP‑based registration flow. Before trying to register a patient, you must configure an SMTP provider so the server can send emails.

1. **Choose an SMTP provider.**
   - you can use a transactional email service (SendGrid, Mailgun, Mailjet, Amazon SES, etc.) or even a personal Gmail account (requires an app password or enabling "less secure" access).
   - most services publish host/port/secure settings; for example:
     ```text
     SMTP_HOST=smtp.sendgrid.net
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=apikey            # SendGrid uses "apikey" literally
     SMTP_PASS=SG.xxxxxxxx       # your SendGrid API key
     ```
   - for Gmail (app-specific password):
     ```text
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=465
     SMTP_SECURE=true
     SMTP_USER=you@gmail.com
     SMTP_PASS=your-app-password
     ```

2. Create a `.env` file inside the `backend/` folder with the following values (add your Supabase credentials as well):

   ```env
   SUPABASE_URL=your-url
   SUPABASE_SERVICE_ROLE_KEY=your-key

   SMTP_HOST=smtp.example.com
   SMTP_PORT=587          # or 465 for SMTPS
   SMTP_SECURE=false      # true if using port 465
   SMTP_USER=you@example.com
   SMTP_PASS=yourpassword
   EMAIL_FROM="Jeevan Connect <no-reply@example.com>"  # optional override
   ```

3. Install dependencies and start the server:
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Verify the configuration** (optional but helpful):
   - run the included helper script to send a test message:
     ```bash
     cd backend
     node sendTestEmail.js recipient@domain.com
     ```
   - check your inbox (or the console if an error occurs).

5. Now when a patient registers, the OTP will be sent for real. The frontend displays a message and you'll receive the code in the specified email address.

(If you forget to configure SMTP the server simply logs the OTP and the flow still works for development.)

---

## OTP Flow

- When a patient fills out the registration form, the frontend POSTs to `/api/send-otp` with the email address.
- The backend generates a 6‑digit code, stores it in memory for 5 minutes, and emails it using Nodemailer.
- After entering the code, the frontend POSTs to `/api/verify-otp` to validate it before issuing a patient ID.

You can extend this logic by persisting OTPs in a database or integrating with a third–party service.
