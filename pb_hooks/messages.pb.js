cat << 'EOF' > /root/pb_hooks/messages.pb.js
onRecordAfterCreateSuccess((e) => {
  const CONTACT_RECIPIENTS_FALLBACK = ["info@sinergiaocupacional.com"];

  function contactRecipients(app) {
    try {
      const rec = app.findFirstRecordByFilter("settings", "email != ''");
      const raw = String((rec && rec.get("email")) || "").trim();
      if (!raw) return CONTACT_RECIPIENTS_FALLBACK.slice();
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } catch (err) {
      console.error("Contact email: error reading settings:", err);
      return CONTACT_RECIPIENTS_FALLBACK.slice();
    }
  }

  function escHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  try {
    const record = e.record;
    const name = String(record.get("name") || "");
    const email = String(record.get("email") || "");
    const subject = String(record.get("subject") || "");
    const message = String(record.get("message") || "");

    const recipients = contactRecipients(e.app).filter((a) => /@/.test(a));

    const html =
      "<h3>Nuevo mensaje desde el formulario de contacto</h3>" +
      "<p><strong>Nombre:</strong> " + escHtml(name) + "</p>" +
      "<p><strong>Email:</strong> " + escHtml(email) + "</p>" +
      "<p><strong>Tema:</strong> " + escHtml(subject) + "</p>" +
      "<p><strong>Mensaje:</strong><br>" + escHtml(message).replace(/\n/g, "<br>") + "</p>";

    const settings = e.app.settings();
    const mail = new MailerMessage({
      from: {
        address: settings.meta.senderAddress,
        name: settings.meta.senderName,
      },
      to: recipients.map((address) => ({ address })),
      subject: "Nuevo mensaje de contacto" + (subject ? ": " + subject : ""),
      html: html,
    });

    e.app.newMailClient().send(mail);
    console.log("Contact email sent to " + recipients.join(", ") + " for record " + record.id);
  } catch (err) {
    console.error("Contact email sending failed for record:", err);
  }

  e.next();
}, "messages");
EOF
