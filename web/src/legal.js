// Aviso legal, privacidad y cookies. La página /legal solo se publica si TITULAR está completo.

// ===== Aviso legal, privacidad y cookies =====
// Datos del titular (obligatorios por la LSSI y el RGPD)
export const TITULAR = { nombre: "Zones Verdes S.L. (nombre comercial: Jardinería Adrover)", nif: "B07566193", dir: "Ctra. Son Servera-Capdepera, km 11,600, 07580 Capdepera (Illes Balears)" };
// La página legal solo se publica cuando los tres datos están rellenados
export const LEGAL_LISTO = Object.values(TITULAR).every((v) => v && !v.startsWith("__"));
export const LEGAL = {
  es: {
    pie: "Aviso legal y privacidad",
    meta: ["Aviso legal y política de privacidad · Jardinería Adrover", "Aviso legal, política de privacidad y política de cookies del sitio web de Jardinería Adrover."],
    ph: ["Información legal", "Aviso legal y privacidad", "Información sobre el titular del sitio web y sobre cómo tratamos los datos personales de quienes contactan con nosotros."],
    act: "Última actualización: {F}",
    sec: [
      ["1. Aviso legal", [
        "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el presente sitio web, {W}, es titularidad de {T}, con NIF {N} y domicilio en {D} (en adelante, «el Titular»). Correo electrónico de contacto: {E}.",
        "El acceso y la navegación por el sitio web atribuyen la condición de usuario e implican la aceptación de las presentes condiciones. Los contenidos del sitio (textos, fotografías, diseño y logotipos) son propiedad del Titular o se utilizan con la debida autorización, y quedan protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación con fines comerciales sin autorización expresa.",
        "La información de las secciones «Guía» y «Herramientas» tiene carácter meramente orientativo y divulgativo y no sustituye el asesoramiento profesional. La sección «Noticias» muestra titulares y enlaces a medios de terceros, generados de forma automática; el Titular no se responsabiliza de los contenidos de dichos sitios externos, que se rigen por sus propias condiciones y políticas de privacidad.",
      ]],
      ["2. Política de privacidad", [
        "<b>Responsable del tratamiento.</b> {T}, NIF {N}, {D}. Correo electrónico: {E}.",
        "<b>Datos que tratamos.</b> Este sitio web no dispone de formularios de registro ni de áreas de usuario y no almacena en servidor los datos introducidos en el formulario de presupuesto. Únicamente tratamos los datos personales que el propio usuario nos facilita de forma voluntaria al ponerse en contacto con nosotros por WhatsApp, SMS o correo electrónico (por ejemplo, nombre, número de teléfono, dirección de correo electrónico, municipio, fotografías y el contenido del mensaje).",
        "<b>Finalidad.</b> Atender la consulta o solicitud de presupuesto y, en su caso, gestionar la prestación del servicio contratado. No se elaboran perfiles ni se toman decisiones automatizadas.",
        "<b>Base jurídica.</b> La aplicación de medidas precontractuales y, en su caso, la ejecución del contrato a petición del interesado (artículo 6.1.b del Reglamento (UE) 2016/679, RGPD), así como el consentimiento del interesado al contactar voluntariamente con nosotros (artículo 6.1.a RGPD).",
        "<b>Conservación.</b> Los datos se conservarán durante el tiempo necesario para atender la solicitud y, en su caso, mientras se mantenga la relación comercial, así como durante los plazos exigidos por la legislación aplicable. El interesado puede solicitar en cualquier momento la supresión de su número de teléfono, su dirección de correo electrónico y el resto de sus datos escribiendo a {E}, salvo que deban conservarse por obligación legal.",
        "<b>Destinatarios.</b> No cedemos ni vendemos datos personales a terceros, salvo obligación legal. Este sitio web no contiene publicidad. Para prestar el servicio contamos con proveedores que actúan como encargados del tratamiento: Cloudflare, Inc. (alojamiento y seguridad del sitio web, que trata datos técnicos de conexión como la dirección IP) y, según el canal que elija el usuario, Google LLC (correo electrónico) y WhatsApp Ireland Ltd. (mensajería). Algunos de estos proveedores pueden realizar transferencias internacionales de datos amparadas en el Marco de Privacidad de Datos UE-EE. UU. o en cláusulas contractuales tipo aprobadas por la Comisión Europea.",
        "<b>Derechos.</b> El interesado puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar su consentimiento en cualquier momento, dirigiéndose a {E}. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
        "<b>Menores.</b> Este sitio web no está dirigido a menores de 14 años, que no deberán facilitarnos datos personales.",
      ]],
      ["3. Política de cookies", [
        "Este sitio web no utiliza cookies propias ni de terceros con fines analíticos, publicitarios o de seguimiento, ni herramientas de medición de audiencia. Las tipografías y las imágenes se sirven desde el propio dominio, sin conexiones a servicios de terceros. Únicamente podrían emplearse elementos técnicos estrictamente necesarios para la seguridad y el funcionamiento del sitio, exentos de consentimiento conforme al artículo 22.2 de la LSSI-CE.",
        "Los botones de WhatsApp, SMS y correo electrónico solo abren la aplicación correspondiente del dispositivo del usuario cuando este los pulsa. A partir de ese momento se aplican las condiciones y la política de privacidad del proveedor elegido por el usuario.",
      ]],
      ["4. Legislación aplicable", [
        "Las presentes condiciones se rigen por la legislación española. En caso de discrepancia entre las versiones lingüísticas de este texto, prevalecerá la versión en castellano.",
      ]],
    ],
    aviso: "Al enviar la solicitud aceptas que tratemos tus datos para responderte. Más información en la <a href=\"{L}\">política de privacidad</a>.",
  },
  ca: {
    pie: "Avís legal i privacitat",
    meta: ["Avís legal i política de privacitat · Jardinería Adrover", "Avís legal, política de privacitat i política de galetes del lloc web de Jardinería Adrover."],
    ph: ["Informació legal", "Avís legal i privacitat", "Informació sobre el titular del lloc web i sobre com tractam les dades personals de les persones que contacten amb nosaltres."],
    act: "Darrera actualització: {F}",
    sec: [
      ["1. Avís legal", [
        "En compliment de l'article 10 de la Llei 34/2002, d'11 de juliol, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE), s'informa que aquest lloc web, {W}, és titularitat de {T}, amb NIF {N} i domicili a {D} (d'ara endavant, «el Titular»). Correu electrònic de contacte: {E}.",
        "L'accés i la navegació pel lloc web atribueixen la condició d'usuari i impliquen l'acceptació d'aquestes condicions. Els continguts del lloc (textos, fotografies, disseny i logotips) són propietat del Titular o s'utilitzen amb la deguda autorització, i estan protegits per la normativa de propietat intel·lectual i industrial. Se'n prohibeix la reproducció, distribució o transformació amb finalitats comercials sense autorització expressa.",
        "La informació de les seccions «Guia» i «Eines» té caràcter merament orientatiu i divulgatiu i no substitueix l'assessorament professional. La secció «Notícies» mostra titulars i enllaços a mitjans de tercers, generats de manera automàtica; el Titular no es fa responsable dels continguts d'aquests llocs externs, que es regeixen per les seves pròpies condicions i polítiques de privacitat.",
      ]],
      ["2. Política de privacitat", [
        "<b>Responsable del tractament.</b> {T}, NIF {N}, {D}. Correu electrònic: {E}.",
        "<b>Dades que tractam.</b> Aquest lloc web no disposa de formularis de registre ni d'àrees d'usuari i no emmagatzema en servidor les dades introduïdes al formulari de pressupost. Únicament tractam les dades personals que el mateix usuari ens facilita voluntàriament quan contacta amb nosaltres per WhatsApp, SMS o correu electrònic (per exemple, nom, número de telèfon, adreça de correu electrònic, municipi, fotografies i el contingut del missatge).",
        "<b>Finalitat.</b> Atendre la consulta o sol·licitud de pressupost i, si escau, gestionar la prestació del servei contractat. No s'elaboren perfils ni es prenen decisions automatitzades.",
        "<b>Base jurídica.</b> L'aplicació de mesures precontractuals i, si escau, l'execució del contracte a petició de la persona interessada (article 6.1.b del Reglament (UE) 2016/679, RGPD), així com el consentiment de la persona interessada en contactar voluntàriament amb nosaltres (article 6.1.a RGPD).",
        "<b>Conservació.</b> Les dades es conservaran durant el temps necessari per atendre la sol·licitud i, si escau, mentre es mantingui la relació comercial, així com durant els terminis exigits per la legislació aplicable. La persona interessada pot sol·licitar en qualsevol moment la supressió del seu número de telèfon, de la seva adreça de correu electrònic i de la resta de dades escrivint a {E}, llevat que s'hagin de conservar per obligació legal.",
        "<b>Destinataris.</b> No cedim ni venem dades personals a tercers, llevat d'obligació legal. Aquest lloc web no conté publicitat. Per prestar el servei comptam amb proveïdors que actuen com a encarregats del tractament: Cloudflare, Inc. (allotjament i seguretat del lloc web, que tracta dades tècniques de connexió com l'adreça IP) i, segons el canal que triï l'usuari, Google LLC (correu electrònic) i WhatsApp Ireland Ltd. (missatgeria). Alguns d'aquests proveïdors poden fer transferències internacionals de dades emparades en el Marc de Privacitat de Dades UE-EUA o en clàusules contractuals tipus aprovades per la Comissió Europea.",
        "<b>Drets.</b> La persona interessada pot exercir els drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat, així com retirar el consentiment en qualsevol moment, adreçant-se a {E}. Així mateix, té dret a presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (www.aepd.es).",
        "<b>Menors.</b> Aquest lloc web no està adreçat a menors de 14 anys, que no ens han de facilitar dades personals.",
      ]],
      ["3. Política de galetes", [
        "Aquest lloc web no utilitza galetes pròpies ni de tercers amb finalitats analítiques, publicitàries o de seguiment, ni eines de mesura d'audiència. Les tipografies i les imatges se serveixen des del mateix domini, sense connexions a serveis de tercers. Únicament es podrien emprar elements tècnics estrictament necessaris per a la seguretat i el funcionament del lloc, exempts de consentiment d'acord amb l'article 22.2 de la LSSI-CE.",
        "Els botons de WhatsApp, SMS i correu electrònic només obren l'aplicació corresponent del dispositiu de l'usuari quan aquest els prem. A partir d'aquest moment s'apliquen les condicions i la política de privacitat del proveïdor triat per l'usuari.",
      ]],
      ["4. Legislació aplicable", [
        "Aquestes condicions es regeixen per la legislació espanyola. En cas de discrepància entre les versions lingüístiques d'aquest text, prevaldrà la versió en castellà.",
      ]],
    ],
    aviso: "En enviar la sol·licitud acceptes que tractem les teves dades per respondre't. Més informació a la <a href=\"{L}\">política de privacitat</a>.",
  },
  en: {
    pie: "Legal notice and privacy",
    meta: ["Legal notice and privacy policy · Jardinería Adrover", "Legal notice, privacy policy and cookie policy of the Jardinería Adrover website."],
    ph: ["Legal information", "Legal notice and privacy", "Information about the owner of this website and how we process the personal data of people who contact us."],
    act: "Last updated: {F}",
    sec: [
      ["1. Legal notice", [
        "In accordance with Article 10 of Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSI-CE), this website, {W}, is owned by {T}, tax ID (NIF) {N}, with registered address at {D} (hereinafter, \"the Owner\"). Contact email: {E}.",
        "Accessing and browsing the website makes you a user and implies acceptance of these terms. The website's content (texts, photographs, design and logos) belongs to the Owner or is used with due authorisation, and is protected by intellectual and industrial property law. Its reproduction, distribution or transformation for commercial purposes without express permission is prohibited.",
        "The information in the \"Guide\" and \"Tools\" sections is for general guidance only and does not replace professional advice. The \"News\" section automatically displays headlines and links to third-party media; the Owner is not responsible for the content of those external sites, which are governed by their own terms and privacy policies.",
      ]],
      ["2. Privacy policy", [
        "<b>Data controller.</b> {T}, NIF {N}, {D}. Email: {E}.",
        "<b>Data we process.</b> This website has no registration forms or user accounts and does not store on its servers the data entered in the quote form. We only process the personal data that users voluntarily provide when they contact us by WhatsApp, SMS or email (for example, name, phone number, email address, town, photographs and the content of the message).",
        "<b>Purpose.</b> To answer the enquiry or quote request and, where applicable, to manage the service contracted. No profiling or automated decision-making takes place.",
        "<b>Legal basis.</b> Taking steps at the request of the data subject prior to entering into a contract and, where applicable, the performance of that contract (Article 6(1)(b) of Regulation (EU) 2016/679, GDPR), and the data subject's consent when voluntarily contacting us (Article 6(1)(a) GDPR).",
        "<b>Retention.</b> Data will be kept for as long as necessary to handle the request and, where applicable, for the duration of the business relationship, as well as for the periods required by applicable law. Data subjects may at any time request the erasure of their phone number, email address and any other data by writing to {E}, unless the data must be retained by law.",
        "<b>Recipients.</b> We do not disclose or sell personal data to third parties, except where required by law. This website contains no advertising. To provide the service we use providers acting as data processors: Cloudflare, Inc. (website hosting and security, which processes technical connection data such as the IP address) and, depending on the channel chosen by the user, Google LLC (email) and WhatsApp Ireland Ltd. (messaging). Some of these providers may carry out international data transfers covered by the EU-U.S. Data Privacy Framework or by standard contractual clauses approved by the European Commission.",
        "<b>Your rights.</b> You may exercise your rights of access, rectification, erasure, objection, restriction of processing and data portability, and withdraw your consent at any time, by writing to {E}. You also have the right to lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).",
        "<b>Minors.</b> This website is not intended for children under 14, who should not provide us with personal data.",
      ]],
      ["3. Cookie policy", [
        "This website does not use first-party or third-party cookies for analytics, advertising or tracking, nor any audience measurement tools. Fonts and images are served from our own domain, with no connections to third-party services. Only technical elements strictly necessary for the security and operation of the site may be used, which are exempt from consent under Article 22.2 LSSI-CE.",
        "The WhatsApp, SMS and email buttons only open the corresponding app on the user's device when pressed. From that point on, the terms and privacy policy of the provider chosen by the user apply.",
      ]],
      ["4. Governing law", [
        "These terms are governed by Spanish law. In the event of any discrepancy between language versions of this text, the Spanish version shall prevail.",
      ]],
    ],
    aviso: "By sending your request you agree that we may process your data in order to reply. More information in our <a href=\"{L}\">privacy policy</a>.",
  },
  de: {
    pie: "Impressum und Datenschutz",
    meta: ["Impressum und Datenschutzerklärung · Jardinería Adrover", "Impressum, Datenschutzerklärung und Cookie-Richtlinie der Website von Jardinería Adrover."],
    ph: ["Rechtliche Hinweise", "Impressum und Datenschutz", "Angaben zum Betreiber dieser Website und dazu, wie wir personenbezogene Daten von Personen verarbeiten, die uns kontaktieren."],
    act: "Stand: {F}",
    sec: [
      ["1. Impressum", [
        "Gemäß Artikel 10 des spanischen Gesetzes 34/2002 vom 11. Juli über Dienste der Informationsgesellschaft und den elektronischen Geschäftsverkehr (LSSI-CE) wird mitgeteilt, dass diese Website, {W}, von {T}, Steuernummer (NIF) {N}, mit Sitz in {D} (im Folgenden „der Betreiber“) betrieben wird. Kontakt-E-Mail: {E}.",
        "Mit dem Zugriff auf die Website und ihrer Nutzung werden Sie Nutzer und erkennen diese Bedingungen an. Die Inhalte der Website (Texte, Fotos, Design und Logos) sind Eigentum des Betreibers oder werden mit entsprechender Genehmigung verwendet und sind durch das Urheber- und Markenrecht geschützt. Ihre Vervielfältigung, Verbreitung oder Bearbeitung zu gewerblichen Zwecken ohne ausdrückliche Zustimmung ist untersagt.",
        "Die Informationen in den Bereichen „Ratgeber“ und „Werkzeuge“ dienen ausschließlich der allgemeinen Orientierung und ersetzen keine fachliche Beratung. Der Bereich „News“ zeigt automatisch Schlagzeilen und Links zu Medien Dritter an; der Betreiber ist nicht für die Inhalte dieser externen Websites verantwortlich, für die deren eigene Bedingungen und Datenschutzbestimmungen gelten.",
      ]],
      ["2. Datenschutzerklärung", [
        "<b>Verantwortlicher.</b> {T}, NIF {N}, {D}. E-Mail: {E}.",
        "<b>Welche Daten wir verarbeiten.</b> Diese Website verfügt über keine Registrierungsformulare oder Nutzerkonten und speichert die in das Angebotsformular eingegebenen Daten nicht auf ihren Servern. Wir verarbeiten ausschließlich die personenbezogenen Daten, die Nutzer uns freiwillig mitteilen, wenn sie uns per WhatsApp, SMS oder E-Mail kontaktieren (z. B. Name, Telefonnummer, E-Mail-Adresse, Wohnort, Fotos und Inhalt der Nachricht).",
        "<b>Zweck.</b> Beantwortung der Anfrage oder Angebotsanfrage und gegebenenfalls Abwicklung der beauftragten Leistung. Es findet weder Profiling noch eine automatisierte Entscheidungsfindung statt.",
        "<b>Rechtsgrundlage.</b> Durchführung vorvertraglicher Maßnahmen und gegebenenfalls Erfüllung des Vertrags auf Anfrage der betroffenen Person (Art. 6 Abs. 1 lit. b der Verordnung (EU) 2016/679, DSGVO) sowie die Einwilligung der betroffenen Person durch die freiwillige Kontaktaufnahme (Art. 6 Abs. 1 lit. a DSGVO).",
        "<b>Speicherdauer.</b> Die Daten werden so lange gespeichert, wie es zur Bearbeitung der Anfrage und gegebenenfalls für die Dauer der Geschäftsbeziehung erforderlich ist, sowie für die gesetzlich vorgeschriebenen Fristen. Betroffene können jederzeit die Löschung ihrer Telefonnummer, ihrer E-Mail-Adresse und aller weiteren Daten per E-Mail an {E} verlangen, sofern keine gesetzliche Aufbewahrungspflicht besteht.",
        "<b>Empfänger.</b> Wir geben personenbezogene Daten weder weiter noch verkaufen wir sie an Dritte, es sei denn, wir sind gesetzlich dazu verpflichtet. Diese Website enthält keine Werbung. Zur Erbringung des Dienstes setzen wir Auftragsverarbeiter ein: Cloudflare, Inc. (Hosting und Sicherheit der Website; verarbeitet technische Verbindungsdaten wie die IP-Adresse) sowie, je nach vom Nutzer gewähltem Kanal, Google LLC (E-Mail) und WhatsApp Ireland Ltd. (Messaging). Einige dieser Anbieter können Daten in Drittländer übermitteln; dies erfolgt auf Grundlage des EU-US-Datenschutzrahmens oder von der Europäischen Kommission genehmigter Standardvertragsklauseln.",
        "<b>Ihre Rechte.</b> Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Widerspruch, Einschränkung der Verarbeitung und Datenübertragbarkeit sowie das Recht, Ihre Einwilligung jederzeit zu widerrufen. Wenden Sie sich dazu an {E}. Außerdem können Sie bei der spanischen Datenschutzbehörde (www.aepd.es) Beschwerde einlegen.",
        "<b>Minderjährige.</b> Diese Website richtet sich nicht an Kinder unter 14 Jahren; diese sollten uns keine personenbezogenen Daten übermitteln.",
      ]],
      ["3. Cookie-Richtlinie", [
        "Diese Website verwendet weder eigene noch Cookies von Drittanbietern zu Analyse-, Werbe- oder Trackingzwecken und setzt keine Reichweitenmessung ein. Schriftarten und Bilder werden von der eigenen Domain ausgeliefert, ohne Verbindungen zu Diensten Dritter. Es können lediglich technisch unbedingt erforderliche Elemente für die Sicherheit und den Betrieb der Website eingesetzt werden, die gemäß Art. 22.2 LSSI-CE keiner Einwilligung bedürfen.",
        "Die Schaltflächen für WhatsApp, SMS und E-Mail öffnen lediglich die entsprechende App auf dem Gerät des Nutzers, wenn dieser sie antippt. Ab diesem Zeitpunkt gelten die Bedingungen und Datenschutzbestimmungen des vom Nutzer gewählten Anbieters.",
      ]],
      ["4. Anwendbares Recht", [
        "Diese Bedingungen unterliegen spanischem Recht. Bei Abweichungen zwischen den Sprachfassungen dieses Textes ist die spanische Fassung maßgeblich.",
      ]],
    ],
    aviso: "Mit dem Absenden erklären Sie sich einverstanden, dass wir Ihre Daten zur Beantwortung verarbeiten. Mehr dazu in der <a href=\"{L}\">Datenschutzerklärung</a>.",
  },
};
export const ACTUALIZADO = "2026-10-22";
