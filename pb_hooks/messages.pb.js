// Sinergia Ocupacional - envía un correo al buzón de la empresa cuando se crea
// un registro en la colección "messages" (formulario de contacto).
//
// Coloca este archivo en el directorio pb_hooks/ de tu instancia PocketBase
// (junto a pb_data/). El servidor lo recarga automáticamente.
//
// Requiere PocketBase >= 0.23 (usa onRecordCreateRequest, deprecado era
// onRecordAfterCreateRequest).
//
// Destinatarios: se toman del campo `email` de la colección "settings"
// (el mismo que se edita desde el panel de administración). Si está vacío,
// se usa la lista de respaldo de abajo.
//
// IMPORTANTE: este hook NUNCA debe fallar la creación del registro. El envío
// del correo es fire-and-forget: cualquier error se registra en el stdout de
// PocketBase pero el registro siempre se guarda.
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

onRecordCreateRequest((e) => {
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
    const from = {
      address: settings.meta.senderAddress,
      name: settings.meta.senderName,
    };

    const mail = new MailerMessage({
      from,
      to: recipients.map((address) => ({ address })),
      subject: "Nuevo mensaje de contacto" + (subject ? ": " + subject : ""),
      html,
    });

    const app = e.app;
    const recordId = record.id;
    // Envío fire-and-forget: no bloquea la petición ni puede fallarla.
    Promise.resolve()
      .then(() => app.newMailClient().send(mail))
      .then(() => {
        console.log("Contact email sent to " + recipients.join(", ") + " for record " + recordId);
      })
      .catch((err) => {
        console.error("Contact email sending failed for record " + recordId + ":", err);
      });
  } catch (err) {
    console.error("Contact email: error en el hook (la creación del registro no se afecta):", err);
  }

  return e.next();
}, "messages");