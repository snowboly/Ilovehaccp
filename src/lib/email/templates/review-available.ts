type ReviewAvailableEmailProps = {
  appUrl: string;
  planId: string;
};

export function reviewAvailableEmailHtml(props: ReviewAvailableEmailProps): string {
  const reviewUrl = `${props.appUrl}/dashboard/plans/${props.planId}/review`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your review is available</title>
  <!--[if mso]><style type="text/css">body, table, td {font-family: Arial, Helvetica, sans-serif !important;}</style><![endif]-->
  <style>
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background-color:#f1f5f9; margin:0; padding:0; -webkit-text-size-adjust:100%; }
    .wrapper { width:100%; table-layout:fixed; background-color:#f1f5f9; padding-top:40px; padding-bottom:40px; }
    .container { max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06); border:1px solid #e2e8f0; }
    .header { padding:40px 0 24px 0; text-align:center; background-color:#ffffff; border-bottom:1px solid #f8fafc; }
    .logo-text { font-size:26px; font-weight:900; color:#0f172a; text-decoration:none; letter-spacing:-0.5px; }
    .heart { color:#ef4444; }
    .content { padding:32px 40px 48px 40px; text-align:left; }
    .h1 { color:#1e293b; font-size:24px; font-weight:800; margin:0 0 16px 0; line-height:1.3; }
    .text { color:#475569; font-size:16px; line-height:1.6; margin:0 0 24px 0; }
    .button-container { text-align:center; margin:32px 0; }
    .button { display:inline-block; background-color:#2563eb; color:#ffffff !important; font-size:16px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:8px; box-shadow:0 4px 6px -1px rgba(37,99,235,.2); }
    .button:hover { background-color:#1d4ed8; }
    .footer { background-color:#f8fafc; padding:24px; text-align:center; border-top:1px solid #e2e8f0; }
    .footer-text { color:#94a3b8; font-size:12px; line-height:1.5; margin:0; }
    .footer-link { color:#64748b; text-decoration:underline; }
    @media only screen and (max-width: 600px) { .container{width:100% !important; border-radius:0 !important; border:none;} .content{padding:24px !important;} .wrapper{padding:0 !important;} }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">i<span class="heart">❤️</span>HACCP</div>
      </div>

      <div class="content">
        <h1 class="h1">Your review is available</h1>

        <p class="text">Hi there,</p>
        <p class="text">Your plan review is now available in your dashboard.</p>

        <div class="button-container">
          <a href="${reviewUrl}" class="button" target="_blank">View Review</a>
        </div>

        <p class="text" style="font-size:14px; color:#64748b; margin-top:24px;">
          <strong>Disclaimer:</strong> This review provides feedback only and does not constitute approval, validation, or certification.
        </p>

        <p class="text" style="font-size:14px; color:#94a3b8; margin-top:32px; text-align:center;">
          For privacy and security, review details are shown only inside your account.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          © 2026 iLoveHACCP.com<br>
          Making food safety compliance simple.<br><br>
          <a href="https://ilovehaccp.com/terms" class="footer-link">Terms</a> •
          <a href="https://ilovehaccp.com/privacy" class="footer-link">Privacy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
