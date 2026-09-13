// Sinergia Ocupacional - envía un correo al buzón de la empresa cuando se crea
// un registro en la colección "messages" (formulario de contacto).
//
// Coloca este archivo en el directorio pb_hooks/ de tu instancia PocketBase
// (junto a pb_data/). El servidor lo recarga automáticamente.
//
// Destinatarios del correo (edítalos si cambian):
const CONTACT_RECIPIENTS = ["info@sinergiaocupacional.com"];

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
    to: CONTACT_RECIPIENTS.map((address) => ({ address })),
    subject: "Nuevo mensaje de contacto" + (subject ? ": " + subject : ""),
    html,
  });

  return e.app
    .newMailClient()
    .send(mail)
    .then(() => {
      console.log("Contact email sent for record " + record.id);
    })
    .catch((err) => {
      console.error("Contact email sending failed for record " + record.id + ":", err);
      return null;
    });
}, "messages");