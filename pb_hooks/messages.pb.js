// Sinergia Ocupacional - envía un correo al buzón de la empresa cuando se crea
// un registro en la colección "messages" (formulario de contacto).
//
// Coloca este archivo en el directorio pb_hooks/ de tu instancia PocketBase
// (junto a pb_data/). El servidor lo recarga automáticamente.
//
// Destinatarios: se toman del campo `email` de la colección "settings"
// (el mismo que se edita desde el panel de administración). Si está vacío,
// se usa la lista de respaldo de abajo.
const CONTACT_RECIPIENTS_FALLBACK = ["info@sinergiaocupacional.com"];

function contactRecipients(app) {
  try {
    const rec = app.dao().findFirstRecordByFilter("settings", "email != ''");
    const raw = String((rec && rec.get("email")) || '').trim();
    if (!raw) return CONTACT_RECIPIENTS_FALLBACK.slice();
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    console.error("Contact email: no se pudo leer settings para destinatarios:", err);
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

onRecordAfterCreateRequest((e) => {
  const record = e.record;
  const name = String(record.get("name") || "");
  const email = String(record.get("email") || "");
  const subject = String(record.get("subject") || "");
  const message = String(record.get("message") || "");

  const recipients = contactRecipients(e.app);

  const html =
    "<h3>Nuevo mensaje desde el formulario de contacto</h3>" +
    "<p><strong>Nombre:</strong> " + escHtml(name) + "</p>" +
    "<p><strong>Email:</strong> " + escHtml(email) + "</p>" +
    "<p><strong>Tema:</strong> " + escHtml(subject) + "</p>" +
    "<p><strong>Mensaje:</strong><br>" + escHtml(message).replace(/\n/g, "<br>") + "</p>";

  const mail = new MailerMessage({
    from: {
      address: e.app.settings().meta.senderAddress,
      name: e.app.settings().meta.senderName,
    },
    to: recipients.map((address) => ({ address })),
    subject: "Nuevo mensaje de contacto" + (subject ? ": " + subject : ""),
    html,
  });

  return e.app
    .newMailClient()
    .send(mail)
    .then(() => {
      console.log("Contact email sent to " + recipients.join(", ") + " for record " + record.id);
    })
    .catch((err) => {
      console.error("Contact email sending failed for record " + record.id + ":", err);
      return null;
    });
}, "messages");