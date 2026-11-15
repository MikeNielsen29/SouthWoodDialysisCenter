/**
 * CloudBase DB — Google Apps Script API
 * -------------------------------------
 * Deployed as a Web App and called ONLY from the Next.js server in this repo
 * (see lib/sheets/client.ts). The browser never talks to this script.
 *
 * Transport contract
 *   POST, Content-Type: application/json
 *   Body: { action, payload, auth: { key, ts, nonce, sig } }
 *     sig  = hex( HMAC_SHA256( GS_SHARED_SECRET, ts + "\n" + action + "\n" + canonical(payload) ) )
 *     canonical() = JSON with recursively sorted object keys (mirrored in lib/sheets/canonical.ts)
 *
 *   Response is ALWAYS HTTP 200; the outcome lives in the body:
 *     { ok: true,  data: ... , meta: { ms } }
 *     { ok: false, error: { code, message }, meta: { ms } }
 *
 * Why the signature is in the body: Apps Script web apps cannot read custom
 * request headers, and a scheme with headers would silently be unverifiable.
 *
 * Setup: see google-apps-script/README.md. Secrets live in Script Properties,
 * never in this file.
 */

var CFG = {
  SECRET_PROP: 'GS_SHARED_SECRET',
  PEPPER_PROP: 'HASH_PEPPER',
  SHEET_ID_PROP: 'SHEET_ID',
  BACKUP_FOLDER: 'CloudBase DB Backups',
  BACKUP_RETENTION_DAYS: 30,
  SCHEMA_VERSION: '1',
  META_TAB: '_Meta',
  PASSWORD_ROUNDS: 500,
  DEFAULT_ADMIN_CN: 'SDC-ADMIN',
  DEFAULT_ADMIN_EMAIL: 'admin@southwooddialysis.com',
  DEFAULT_ADMIN_PASSWORD: 'Southwood2026!',
};

/* ------------------------------------------------------------------ */
/* Schema (single source of truth for tab creation)                    */
/* ------------------------------------------------------------------ */

function col(name, width, opts) {
  opts = opts || {};
  return {
    name: name,
    width: width || 160,
    values: opts.values || null,
    secret: !!opts.secret,
  };
}

var ENUM = {
  publish: ['draft', 'published'],
  testimonial: ['Pending', 'Approved', 'Rejected'],
  inquiry: ['New', 'Read', 'Closed'],
  role: ['Super Admin', 'Admin', 'Page Editor', 'Patient'],
  otpPurpose: ['login', 'reset'],
  appointment: ['Requested', 'Confirmed', 'Completed', 'Cancelled', 'No-show'],
  queue: ['Waiting', 'Ongoing', 'Completed'],
  billing: ['Unpaid', 'Paid', 'Partial', 'Void'],
  fileCategory: ['lab', 'image'],
  fileStatus: ['Pending', 'Released', 'Archived'],
};

var TABS = [
  /* ---------------- ContentDB ---------------- */
  {
    name: 'Pages',
    columns: [
      col('id', 300),
      col('slug', 150),
      col('title', 260),
      col('meta_title', 320),
      col('meta_description', 420),
      col('h1', 260),
      col('og_image', 260),
      col('status', 110, { values: ENUM.publish }),
      col('updated_at', 170),
      col('updated_by', 170),
    ],
  },
  {
    name: 'Sections',
    columns: [
      col('id', 300),
      col('page_slug', 130),
      col('section_key', 160),
      col('sort_order', 90),
      col('eyebrow', 180),
      col('heading', 320),
      col('emphasis', 180),
      col('body', 520),
      col('image_url', 260),
      col('image_alt', 240),
      col('cta_label', 150),
      col('cta_href', 190),
      col('status', 110, { values: ENUM.publish }),
    ],
  },
  {
    name: 'Services',
    columns: [
      col('id', 300),
      col('slug', 150),
      col('title', 220),
      col('summary', 420),
      col('icon', 130),
      col('sort_order', 90),
      col('status', 110, { values: ENUM.publish }),
    ],
  },
  {
    name: 'News',
    columns: [
      col('id', 300),
      col('slug', 150),
      col('title', 260),
      col('excerpt', 420),
      col('body', 520),
      col('cover_url', 260),
      col('cover_alt', 240),
      col('published_at', 170),
      col('status', 110, { values: ENUM.publish }),
    ],
  },
  {
    name: 'Testimonials',
    columns: [
      col('id', 300),
      col('patient_cn', 120),
      col('display_name', 170),
      col('rating', 70),
      col('body', 440),
      col('status', 110, { values: ENUM.testimonial }),
      col('created_at', 170),
      col('moderated_by', 170),
      col('moderated_at', 170),
    ],
  },
  {
    name: 'Inquiries',
    columns: [
      col('id', 300),
      col('name', 170),
      col('email', 220),
      col('phone', 140),
      col('subject', 260),
      col('message', 520),
      col('status', 110, { values: ENUM.inquiry }),
      col('created_at', 170),
      col('handled_by', 170),
      col('notes', 300),
    ],
  },
  {
    name: 'Settings',
    columns: [col('key', 200), col('value', 520)],
  },

  /* ---------------- SecurityDB ---------------- */
  {
    name: 'Users',
    columns: [
      col('id', 300),
      col('cn', 120),
      col('full_name', 200),
      col('email', 220),
      col('phone', 140),
      col('role', 120, { values: ENUM.role }),
      col('password_hash', 340, { secret: true }),
      col('otp_required', 110),
      col('is_active', 100),
      col('must_change_password', 150),
      col('failed_count', 100),
      col('locked_until', 170),
      col('last_login_at', 170),
      col('created_at', 170),
    ],
  },
  {
    name: 'OtpCodes',
    columns: [
      col('id', 300),
      col('user_id', 300),
      col('code_hash', 340, { secret: true }),
      col('purpose', 100, { values: ENUM.otpPurpose }),
      col('expires_at', 170),
      col('attempts', 90),
      col('consumed_at', 170),
    ],
  },
  {
    name: 'LoginAttempts',
    columns: [
      col('id', 300),
      col('identifier', 200),
      col('ip_hash', 340),
      col('ua_hash', 340),
      col('success', 90),
      col('created_at', 170),
    ],
  },
  {
    name: 'AuditLog',
    columns: [
      col('id', 300),
      col('actor_id', 170),
      col('actor_role', 130),
      col('action', 220),
      col('entity', 150),
      col('entity_id', 300),
      col('meta_json', 480),
      col('ip_hash', 340),
      col('created_at', 170),
    ],
  },
  {
    name: 'Consents',
    columns: [
      col('id', 300),
      col('user_id', 300),
      col('version', 90),
      col('accepted_at', 170),
      col('ip_hash', 340),
    ],
  },

  /* ---------------- Operational ---------------- */
  {
    name: 'Appointments',
    columns: [
      col('id', 300),
      col('patient_cn', 120),
      col('scheduled_at', 170),
      col('duration_min', 110),
      col('chair', 110),
      col('status', 130, { values: ENUM.appointment }),
      col('notes', 320),
      col('reminder_sent_at', 170),
      col('created_at', 170),
      col('updated_at', 170),
    ],
  },
  {
    name: 'Queue',
    columns: [
      col('id', 300),
      col('appointment_id', 300),
      col('patient_cn', 120),
      col('state', 110, { values: ENUM.queue }),
      col('position', 90),
      col('started_at', 170),
      col('completed_at', 170),
      col('updated_at', 170),
    ],
  },
  {
    name: 'Billing',
    columns: [
      col('id', 300),
      col('patient_cn', 120),
      col('invoice_no', 140),
      col('description', 320),
      col('amount_php', 120),
      col('status', 110, { values: ENUM.billing }),
      col('issued_at', 170),
      col('paid_at', 170),
      col('notes', 300),
    ],
  },
  {
    name: 'Shifts',
    columns: [
      col('id', 300),
      col('staff_cn', 120),
      col('starts_at', 170),
      col('ends_at', 170),
      col('station', 150),
      col('notes', 300),
      col('created_at', 170),
    ],
  },

  /* ---------------- FilesDB + system ---------------- */
  {
    name: 'Files',
    columns: [
      col('id', 300),
      col('patient_cn', 120),
      col('title', 260),
      col('category', 110, { values: ENUM.fileCategory }),
      col('telegram_file_id', 380),
      col('telegram_message_id', 160),
      col('mime', 180),
      col('size_bytes', 110),
      col('checksum_sha256', 340),
      col('iv', 220),
      col('auth_tag', 220),
      col('encrypted', 100),
      col('uploaded_by', 170),
      col('uploaded_at', 170),
      col('released_at', 170),
      col('status', 110, { values: ENUM.fileStatus }),
    ],
  },
  {
    name: CFG.META_TAB,
    columns: [col('key', 220), col('value', 520)],
  },
];

var SETTINGS_SEED = [
  'hotline',
  'email',
  'address',
  'hours',
  'map_lat',
  'map_lng',
  'facebook',
  'instagram',
  'x',
  'linkedin',
  'gsc_verification',
  'disclaimer',
  'consent_version',
];

/* ------------------------------------------------------------------ */
/* Web app entry points                                                */
/* ------------------------------------------------------------------ */

/**
 * Actions that intentionally skip the API key. Sign-in is one of them: the
 * password is verified here, and gating it behind a secret that can be
 * misconfigured is what locked the owner out of his own dashboard.
 */
var PUBLIC_ACTIONS = {
  'system.health': true,
  'auth.login': true,
  'public.content': true,
};

function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  var started = Date.now();
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || '');

    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents) || {};
      } catch (parseError) {
        throw apiError_('BAD_REQUEST', 'Malformed JSON');
      }
    }
    if (!action && typeof body.action === 'string') action = body.action;
    if (!action) throw apiError_('BAD_REQUEST', 'Missing action');

    if (!PUBLIC_ACTIONS[action]) requireKey_(params);

    var handler = ACTIONS[action];
    if (!handler) throw apiError_('UNKNOWN_ACTION', 'Unknown action');

    var payload = body.payload && typeof body.payload === 'object' ? body.payload : body;
    var data = handler(payload, null) || {};
    return json_({ ok: true, data: data, meta: { action: action, ms: Date.now() - started } });
  } catch (error) {
    var code = (error && error.code) || 'INTERNAL';
    var message = (error && error.publicMessage) || 'Request failed';
    Logger.log(
      'CloudBase DB error [' + code + ']: ' + (error && error.stack ? error.stack : String(error))
    );
    return json_({
      ok: false,
      error: { code: code, message: message },
      meta: { ms: Date.now() - started },
    });
  }
}

/*
 * Action registry. Handlers are defined further down as properties of `A` and
 * are only dereferenced at request time, so declaration order does not matter.
 */
var ACTIONS = {
  'system.setup': function () {
    return setup_();
  },
  'system.health': function () {
    return health_();
  },
  'system.backup': function () {
    return backup_();
  },

  'public.content': function (p, a) {
    return A.publicContent(p, a);
  },

  'content.listPages': function (p, a) { return A.listPages(p, a); },
  'content.upsertPage': function (p, a) { return A.upsertPage(p, a); },
  'content.listSections': function (p, a) { return A.listSections(p, a); },
  'content.upsertSection': function (p, a) { return A.upsertSection(p, a); },
  'content.listServices': function (p, a) { return A.listServices(p, a); },
  'content.upsertService': function (p, a) { return A.upsertService(p, a); },
  'content.deleteService': function (p, a) { return A.deleteService(p, a); },
  'content.listNews': function (p, a) { return A.listNews(p, a); },
  'content.upsertNews': function (p, a) { return A.upsertNews(p, a); },
  'content.getSettings': function (p, a) { return A.getSettings(p, a); },
  'content.updateSettings': function (p, a) { return A.updateSettings(p, a); },

  'auth.login': function (p, a) { return A.login(p, a); },
  'auth.changePassword': function (p, a) { return A.changePassword(p, a); },
  'auth.findUser': function (p, a) { return A.findUser(p, a); },
  'auth.setOtp': function (p, a) { return A.setOtp(p, a); },
  'auth.consumeOtp': function (p, a) { return A.consumeOtp(p, a); },
  'auth.recordAttempt': function (p, a) { return A.recordAttempt(p, a); },
  'auth.registerFailure': function (p, a) { return A.registerFailure(p, a); },
  'auth.clearFailures': function (p, a) { return A.clearFailures(p, a); },
  'auth.touchLogin': function (p, a) { return A.touchLogin(p, a); },
  'auth.setPasswordHash': function (p, a) { return A.setPasswordHash(p, a); },

  'users.list': function (p, a) { return A.listUsers(p, a); },
  'users.create': function (p, a) { return A.createUser(p, a); },
  'users.update': function (p, a) { return A.updateUser(p, a); },

  'inquiries.create': function (p, a) { return A.createInquiry(p, a); },
  'inquiries.list': function (p, a) { return A.listInquiries(p, a); },
  'inquiries.update': function (p, a) { return A.updateInquiry(p, a); },

  'testimonials.create': function (p, a) { return A.createTestimonial(p, a); },
  'testimonials.list': function (p, a) { return A.listTestimonials(p, a); },
  'testimonials.moderate': function (p, a) { return A.moderateTestimonial(p, a); },

  'appointments.list': function (p, a) { return A.listAppointments(p, a); },
  'appointments.create': function (p, a) { return A.createAppointment(p, a); },
  'appointments.update': function (p, a) { return A.updateAppointment(p, a); },

  'files.list': function (p, a) { return A.listFiles(p, a); },
  'files.register': function (p, a) { return A.registerFile(p, a); },
  'files.release': function (p, a) { return A.releaseFile(p, a); },

  'billing.list': function (p, a) { return A.listBilling(p, a); },
  'billing.create': function (p, a) { return A.createBilling(p, a); },
  'billing.update': function (p, a) { return A.updateBilling(p, a); },

  'queue.list': function (p, a) { return A.listQueue(p, a); },
  'queue.update': function (p, a) { return A.updateQueue(p, a); },

  'shifts.list': function (p, a) { return A.listShifts(p, a); },
  'shifts.create': function (p, a) { return A.createShift(p, a); },

  'audit.append': function (p, a) { return A.appendAudit(p, a); },
  'audit.list': function (p, a) { return A.listAudit(p, a); },

  'analytics.summary': function (p, a) { return A.analyticsSummary(p, a); },
};

/* ------------------------------------------------------------------ */
/* Auth / signing                                                      */
/* ------------------------------------------------------------------ */

/** API-key check for every non-public action (`?key=…`). */
function requireKey_(params) {
  var secret = PropertiesService.getScriptProperties().getProperty(CFG.SECRET_PROP);
  if (!secret) throw apiError_('NOT_CONFIGURED', 'Script properties are missing');

  var provided = params && params.key ? String(params.key) : '';
  if (!constantTimeEquals_(provided, secret)) {
    throw apiError_('UNAUTHORIZED', 'Invalid credentials');
  }
}

/**
 * Password hashing, same shape as the LCC Calendar Notebook backend:
 * `sha256$<salt>$<hex>` with a few hundred extra rounds. Apps Script can only
 * run this itself — bcrypt cannot be computed here — so sign-in is verified in
 * the same place where the hash is written.
 */
function hashPassword_(password, salt) {
  var useSalt = salt || uuid_().replace(/-/g, '');
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    useSalt + ':' + password,
    Utilities.Charset.UTF_8
  );
  for (var i = 0; i < CFG.PASSWORD_ROUNDS; i++) {
    digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, digest);
  }
  return 'sha256$' + useSalt + '$' + bytesToHex_(digest);
}

function verifyPassword_(password, stored) {
  var value = String(stored || '');
  if (!value) return false;
  var parts = value.split('$');
  if (parts.length === 3 && parts[0] === 'sha256') {
    return constantTimeEquals_(hashPassword_(password, parts[1]), value);
  }
  return false;
}

function canonical_(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    var items = [];
    for (var i = 0; i < value.length; i++) items.push(canonical_(value[i]));
    return '[' + items.join(',') + ']';
  }
  if (typeof value === 'object') {
    var keys = Object.keys(value).sort();
    var parts = [];
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (value[key] === undefined) continue;
      parts.push(JSON.stringify(key) + ':' + canonical_(value[key]));
    }
    return '{' + parts.join(',') + '}';
  }
  if (typeof value === 'number') return isFinite(value) ? JSON.stringify(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return JSON.stringify(String(value));
}

function bytesToHex_(bytes) {
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    if (b < 0) b += 256;
    hex += (b < 16 ? '0' : '') + b.toString(16);
  }
  return hex;
}

function constantTimeEquals_(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ------------------------------------------------------------------ */
/* System actions                                                      */
/* ------------------------------------------------------------------ */

function setup_() {
  return withLock_(function () {
    var ss = getDb_();
    var created = [];
    var existing = [];

    for (var i = 0; i < TABS.length; i++) {
      var def = TABS[i];
      var sheet = ss.getSheetByName(def.name);
      if (!sheet) {
        sheet = ss.insertSheet(def.name);
        applyHeader_(sheet, def);
        created.push(def.name);
      } else {
        migrateHeader_(sheet, def);
        existing.push(def.name);
      }
    }

    // Remember which spreadsheet this project owns: the web app has no active
    // sheet, so getDb_() falls back to this property.
    PropertiesService.getScriptProperties().setProperty(CFG.SHEET_ID_PROP, ss.getId());

    seedSettings_(ss);
    var defaultAdmin = seedAdmin_(ss);
    if (!getMeta_('installed_at')) setMeta_('installed_at', nowIso_());
    setMeta_('schema_version', CFG.SCHEMA_VERSION);
    setMeta_('last_setup_at', nowIso_());
    installBackupTrigger_();

    return {
      created: created,
      existing: existing,
      tabCount: TABS.length,
      schemaVersion: CFG.SCHEMA_VERSION,
      spreadsheet: ss.getName(),
      defaultAdmin: defaultAdmin,
    };
  });
}

/**
 * Seeded exactly once, only while the Users tab is empty, so a fresh clone of
 * the database is usable immediately. The password is hashed here (sign-in is
 * verified here too) and must be changed on first sign-in.
 */
function seedAdmin_(ss) {
  var users = ss.getSheetByName('Users');
  if (!users) return null;
  if (Math.max(0, users.getLastRow() - 1) > 0) return null;

  appendObject_('Users', {
    id: uuid_(),
    cn: CFG.DEFAULT_ADMIN_CN,
    full_name: 'Administrator',
    email: CFG.DEFAULT_ADMIN_EMAIL,
    phone: '',
    role: 'Super Admin',
    password_hash: hashPassword_(CFG.DEFAULT_ADMIN_PASSWORD),
    otp_required: 'FALSE',
    is_active: 'TRUE',
    must_change_password: 'TRUE',
    failed_count: '0',
    locked_until: '',
    last_login_at: '',
    created_at: nowIso_(),
  });

  return {
    cn: CFG.DEFAULT_ADMIN_CN,
    email: CFG.DEFAULT_ADMIN_EMAIL,
    password: CFG.DEFAULT_ADMIN_PASSWORD,
  };
}

function health_() {
  var ss = getDb_();
  var counts = {};
  var missing = [];

  for (var i = 0; i < TABS.length; i++) {
    var name = TABS[i].name;
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      missing.push(name);
      counts[name] = null;
    } else {
      counts[name] = Math.max(0, sheet.getLastRow() - 1);
    }
  }

  var props = PropertiesService.getScriptProperties();
  return {
    schemaVersion: getMeta_('schema_version') || null,
    installedAt: getMeta_('installed_at') || null,
    lastSetupAt: getMeta_('last_setup_at') || null,
    lastBackupAt: getMeta_('last_backup_at') || null,
    spreadsheet: ss.getName(),
    timeZone: Session.getScriptTimeZone(),
    tabs: counts,
    missingTabs: missing,
    configured: {
      sharedSecret: !!props.getProperty(CFG.SECRET_PROP),
      sharedSecretLength: props.getProperty(CFG.SECRET_PROP)
        ? props.getProperty(CFG.SECRET_PROP).length
        : 0,
      hashPepper: !!props.getProperty(CFG.PEPPER_PROP),
      telegramToken: !!props.getProperty('TELEGRAM_BOT_TOKEN'),
      telegramChat: !!props.getProperty('TELEGRAM_CHAT_ID'),
    },
    adminConfigured: counts['Users'] > 0,
  };
}

function backup_() {
  return withLock_(function () {
    var ss = getDb_();
    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
    var folder = backupFolder_();
    var copy = DriveApp.getFileById(ss.getId()).makeCopy('CloudBase DB backup ' + stamp, folder);
    setMeta_('last_backup_at', nowIso_());
    var pruned = pruneBackups_(folder);
    return { fileId: copy.getId(), name: copy.getName(), pruned: pruned };
  });
}

function backupFromTrigger() {
  try {
    backup_();
  } catch (error) {
    Logger.log('Scheduled backup failed: ' + (error && error.stack ? error.stack : error));
    throw error;
  }
}

function backupFolder_() {
  var folders = DriveApp.getFoldersByName(CFG.BACKUP_FOLDER);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CFG.BACKUP_FOLDER);
}

function pruneBackups_(folder) {
  var cutoff = Date.now() - CFG.BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  var files = folder.getFiles();
  var removed = 0;
  while (files.hasNext()) {
    var file = files.next();
    if (file.getDateCreated().getTime() < cutoff) {
      file.setTrashed(true);
      removed++;
    }
  }
  return removed;
}

function installBackupTrigger_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'backupFromTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('backupFromTrigger').timeBased().everyDays(1).atHour(2).create();
}

/* ------------------------------------------------------------------ */
/* Sheet plumbing                                                      */
/* ------------------------------------------------------------------ */

function getDb_() {
  var active = null;
  try {
    active = SpreadsheetApp.getActiveSpreadsheet();
  } catch (error) {
    active = null;
  }
  if (active) return active;

  var id = PropertiesService.getScriptProperties().getProperty(CFG.SHEET_ID_PROP);
  if (!id) throw apiError_('NOT_CONFIGURED', 'Spreadsheet is not configured');
  return SpreadsheetApp.openById(id);
}

function applyHeader_(sheet, def) {
  var headers = def.columns.map(function (c) {
    return c.name;
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader_(sheet, def);
  seedValidation_(sheet, def);
}

function migrateHeader_(sheet, def) {
  var lastColumn = Math.max(1, sheet.getLastColumn());
  var current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (v) {
    return String(v).trim();
  });

  if (current.join('') === '') {
    applyHeader_(sheet, def);
    return;
  }

  var missing = def.columns.filter(function (c) {
    return current.indexOf(c.name) === -1;
  });
  if (!missing.length) {
    styleHeader_(sheet, def);
    seedValidation_(sheet, def);
    return;
  }

  var startCol = current.length + 1;
  var values = missing.map(function (c) {
    return c.name;
  });
  sheet.getRange(1, startCol, 1, values.length).setValues([values]);
  styleHeader_(sheet, def);
  seedValidation_(sheet, def);
}

function styleHeader_(sheet, def) {
  var width = def.columns.length;
  var header = sheet.getRange(1, 1, 1, width);
  header
    .setFontWeight('bold')
    .setFontColor('#FCFAF6')
    .setBackground('#0B2C26')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  for (var i = 0; i < def.columns.length; i++) {
    var c = def.columns[i];
    sheet.setColumnWidth(i + 1, c.width);
    // Keep ISO timestamps and hashes as text instead of letting Sheets coerce them.
    sheet.getRange(2, i + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat('@');
  }
}

function seedValidation_(sheet, def) {
  var rows = Math.max(sheet.getMaxRows() - 1, 1);
  for (var i = 0; i < def.columns.length; i++) {
    var c = def.columns[i];
    var range = sheet.getRange(2, i + 1, rows, 1);
    if (c.values) {
      range.setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(c.values, true).setAllowInvalid(false).build()
      );
    }
    if (c.secret) {
      range.protect().setWarningOnly(true);
    }
  }
}

function seedSettings_(ss) {
  var sheet = ss.getSheetByName('Settings');
  if (!sheet) return;
  var existing = {};
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var rows = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) existing[String(rows[i][0])] = true;
  }
  for (var k = 0; k < SETTINGS_SEED.length; k++) {
    var key = SETTINGS_SEED[k];
    if (existing[key]) continue;
    var value = key === 'consent_version' ? '1' : '';
    sheet.appendRow([key, value]);
  }
}

function table_(tabName) {
  var sheet = getDb_().getSheetByName(tabName);
  if (!sheet) throw apiError_('NOT_CONFIGURED', 'Tab "' + tabName + '" is missing. Run setup.');
  return sheet;
}

function headers_(sheet) {
  var lastColumn = Math.max(1, sheet.getLastColumn());
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (v) {
    return String(v).trim();
  });
}

function readAll_(tabName) {
  var sheet = table_(tabName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var head = values[0].map(function (v) {
    return String(v).trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = {};
    var empty = true;
    for (var c = 0; c < head.length; c++) {
      row[head[c]] = values[r][c];
      if (values[r][c] !== '' && values[r][c] !== null) empty = false;
    }
    if (!empty) {
      row._row = r + 1;
      out.push(row);
    }
  }
  return out;
}

function appendObject_(tabName, obj) {
  return withLock_(function () {
    var sheet = table_(tabName);
    var head = headers_(sheet);
    var row = head.map(function (key) {
      var value = obj[key];
      return value === undefined || value === null ? '' : value;
    });
    sheet.appendRow(row);
    return obj;
  });
}

function updateById_(tabName, id, patch) {
  return withLock_(function () {
    var sheet = table_(tabName);
    var head = headers_(sheet);
    var idIndex = head.indexOf('id');
    if (idIndex === -1) throw apiError_('INTERNAL', 'Tab has no id column');

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;
    var ids = sheet.getRange(2, idIndex + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        var rowNumber = i + 2;
        var keys = Object.keys(patch);
        for (var k = 0; k < keys.length; k++) {
          var colIndex = head.indexOf(keys[k]);
          if (colIndex === -1) continue;
          sheet.getRange(rowNumber, colIndex + 1).setValue(patch[keys[k]]);
        }
        return rowNumber;
      }
    }
    return null;
  });
}

function countRows_(tabName) {
  var sheet = getDb_().getSheetByName(tabName);
  if (!sheet) return -1;
  return Math.max(0, sheet.getLastRow() - 1);
}

function getMeta_(key) {
  var sheet = getDb_().getSheetByName(CFG.META_TAB);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === key) return rows[i][1];
  }
  return null;
}

function setMeta_(key, value) {
  var sheet = table_(CFG.META_TAB);
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === key) {
        sheet.getRange(i + 2, 2).setValue(value);
        return;
      }
    }
  }
  sheet.appendRow([key, value]);
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw apiError_('BUSY', 'System busy, please try again');
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function apiError_(code, publicMessage) {
  var error = new Error(code + ': ' + publicMessage);
  error.code = code;
  error.publicMessage = publicMessage;
  return error;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function nowIso_() {
  return new Date().toISOString();
}

function uuid_() {
  return Utilities.getUuid();
}

/* ------------------------------------------------------------------ */
/* Spreadsheet menu                                                    */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CloudBase DB')
    .addItem('Run setup / migrate', 'menuSetup')
    .addItem('Set shared secret…', 'menuSetSecret')
    .addItem('Diagnose configuration', 'menuDiagnose')
    .addItem('Health check', 'menuHealth')
    .addItem('Backup now', 'menuBackup')
    .addToUi();
}

/**
 * Writes GS_SHARED_SECRET from inside the script project, so the value lands in
 * the same Script Properties store that the deployed web app reads. The prompt
 * is trimmed: a single trailing space is enough to make every signed request
 * fail validation.
 */
function menuSetSecret() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var answer = ui.prompt(
    CFG.SECRET_PROP,
    'Paste the exact value from the Vercel environment variable:\n(it is stored in Script Properties only)',
    ui.ButtonSet.OK_CANCEL
  );
  if (answer.getSelectedButton() !== ui.Button.OK) return;

  var value = answer.getResponseText().trim();
  if (!value) {
    ui.alert('Nothing was entered — Script Properties left unchanged.');
    return;
  }

  props.setProperty(CFG.SECRET_PROP, value);
  ui.alert(
    'Saved to Script Properties.\n\n' +
      'Key: ' + CFG.SECRET_PROP +
      '\nLength: ' + value.length + ' characters' +
      '\nFingerprint: ' + value.slice(0, 4) + '…' + value.slice(-4) +
      "\n\nThis project's web app URL:\n" + (webAppUrl_() || '(not deployed from this project)') +
      '\n\nIf this URL is not the one in Vercel, the /exec URL belongs to a ' +
      'different Apps Script project — set the property in that one instead.'
  );
}

/** The deployed web app URL of THIS script project, or '' when there is none. */
function webAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (error) {
    return '';
  }
}

/**
 * One-shot report that makes a project mismatch obvious: the URL printed here
 * must be byte-for-byte the GS_WEBAPP_URL configured in Vercel.
 */
function menuDiagnose() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty(CFG.SECRET_PROP);
  var pepper = props.getProperty(CFG.PEPPER_PROP);
  var url = webAppUrl_();

  var dbName = '(unavailable)';
  try {
    var ss = getDb_();
    dbName = ss.getName() + ' — ' + TABS.length + ' tabs, Users: ' +
      Math.max(0, ss.getSheetByName('Users').getLastRow() - 1) + ' rows';
  } catch (error) {
    dbName = 'cannot open spreadsheet: ' + String(error);
  }

  ui.alert(
    'CloudBase DB diagnosis\n\n' +
      'Project web app URL:\n' + (url || '(not deployed from this project!)') +
      '\n\n' + CFG.SECRET_PROP + ': ' +
      (secret ? 'set, ' + secret.length + ' chars, ' + secret.slice(0, 4) + '…' + secret.slice(-4) : 'MISSING') +
      '\n' + CFG.PEPPER_PROP + ': ' + (pepper ? 'set' : 'missing') +
      '\n\nSpreadsheet: ' + dbName +
      '\n\nCompare the URL above with GS_WEBAPP_URL in Vercel. ' +
      'They must be identical, and the secret must be set in the same project that serves that URL.'
  );
}

function menuSetup() {
  var result = setup_();
  var admin = result.defaultAdmin
    ? '\n\nDefault administrator (change the password on first sign-in):' +
      '\nControl number: ' + result.defaultAdmin.cn +
      '\nEmail: ' + result.defaultAdmin.email +
      '\nPassword: ' + result.defaultAdmin.password
    : '\n\nUsers tab already has accounts — no administrator was seeded.';

  SpreadsheetApp.getUi().alert(
    'Setup complete\n\nCreated: ' +
      (result.created.join(', ') || 'none') +
      '\nExisting: ' +
      (result.existing.length ? result.existing.length + ' tabs' : 'none') +
      '\nSchema version: ' +
      result.schemaVersion +
      admin
  );
}

function menuHealth() {
  var result = health_();
  var lines = [];
  for (var key in result.tabs) {
    if (result.tabs.hasOwnProperty(key)) lines.push(key + ': ' + result.tabs[key]);
  }
  SpreadsheetApp.getUi().alert(
    'CloudBase DB health\n\nSchema: ' +
      result.schemaVersion +
      '\nLast backup: ' +
      (result.lastBackupAt || 'never') +
      '\nSecrets ok: ' +
      (result.configured.sharedSecret
        ? 'yes (' + result.configured.sharedSecretLength + ' chars)'
        : 'NO — set GS_SHARED_SECRET') +
      '\n\n' +
      lines.join('\n')
  );
}

function menuBackup() {
  var result = backup_();
  SpreadsheetApp.getUi().alert('Backup created: ' + result.name);
}

/* ------------------------------------------------------------------ */
/* Action handlers — this is the only backend file                      */
/* ------------------------------------------------------------------ */

var A = {};

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

A.publicContent = function () {
  var pages = published_(readAll_('Pages'));
  var sections = published_(readAll_('Sections'));
  var services = published_(readAll_('Services')).sort(bySortOrder_('sort_order'));
  var news = published_(readAll_('News')).sort(byDesc_('published_at')).slice(0, 6);

  var testimonials = readAll_('Testimonials')
    .filter(function (row) {
      return row.status === 'Approved';
    })
    .slice(-6)
    .reverse();

  return {
    pages: strip_(pages),
    sections: strip_(sections),
    services: strip_(services),
    news: strip_(news),
    // patient_cn is never exposed publicly.
    testimonials: testimonials.map(function (row) {
      return {
        display_name: text_(row.display_name),
        rating: text_(row.rating) || '5',
        body: text_(row.body),
        created_at: text_(row.created_at),
      };
    }),
    settings: settingsMap_(),
  };
};

A.listPages = function () {
  return strip_(readAll_('Pages'));
};

A.upsertPage = function (payload) {
  var slug = requireText_(payload.slug, 'slug');
  var fields = {
    slug: slug,
    title: text_(payload.title),
    meta_title: text_(payload.meta_title),
    meta_description: text_(payload.meta_description),
    h1: text_(payload.h1),
    og_image: text_(payload.og_image),
    status: payload.status === 'draft' ? 'draft' : 'published',
    updated_at: nowIso_(),
    updated_by: text_(payload.updated_by),
  };

  var existing = find_(readAll_('Pages'), function (row) {
    return row.slug === slug;
  });

  if (existing) {
    updateById_('Pages', existing.id, fields);
    return { id: existing.id, created: false };
  }

  var id = uuid_();
  fields.id = id;
  appendObject_('Pages', fields);
  return { id: id, created: true };
};

A.listSections = function (payload) {
  var rows = readAll_('Sections');
  if (payload && payload.page_slug) {
    rows = rows.filter(function (row) {
      return row.page_slug === payload.page_slug;
    });
  }
  return strip_(rows);
};

A.upsertSection = function (payload) {
  var pageSlug = requireText_(payload.page_slug, 'page_slug');
  var key = requireText_(payload.section_key, 'section_key');

  var fields = {
    page_slug: pageSlug,
    section_key: key,
    sort_order: text_(payload.sort_order) || '0',
    eyebrow: text_(payload.eyebrow),
    heading: text_(payload.heading),
    emphasis: text_(payload.emphasis),
    body: text_(payload.body),
    image_url: text_(payload.image_url),
    image_alt: text_(payload.image_alt),
    cta_label: text_(payload.cta_label),
    cta_href: text_(payload.cta_href),
    status: payload.status === 'draft' ? 'draft' : 'published',
  };

  var existing = find_(readAll_('Sections'), function (row) {
    return row.page_slug === pageSlug && row.section_key === key;
  });

  if (existing) {
    updateById_('Sections', existing.id, fields);
    return { id: existing.id, created: false };
  }

  var id = uuid_();
  fields.id = id;
  appendObject_('Sections', fields);
  return { id: id, created: true };
};

A.listServices = function () {
  return strip_(readAll_('Services').sort(bySortOrder_('sort_order')));
};

A.upsertService = function (payload) {
  var slug = requireText_(payload.slug, 'slug');
  var fields = {
    slug: slug,
    title: requireText_(payload.title, 'title'),
    summary: text_(payload.summary),
    icon: text_(payload.icon) || 'Droplets',
    sort_order: text_(payload.sort_order) || '0',
    status: payload.status === 'draft' ? 'draft' : 'published',
  };

  var existing = find_(readAll_('Services'), function (row) {
    return row.slug === slug;
  });

  if (existing) {
    updateById_('Services', existing.id, fields);
    return { id: existing.id, created: false };
  }

  var id = uuid_();
  fields.id = id;
  appendObject_('Services', fields);
  return { id: id, created: true };
};

A.deleteService = function (payload) {
  var id = requireText_(payload.id, 'id');
  var sheet = table_('Services');
  var head = headers_(sheet);
  var idIndex = head.indexOf('id');
  var rows = readAll_('Services');
  var row = find_(rows, function (item) {
    return item.id === id;
  });
  if (!row) return { deleted: false };
  sheet.deleteRow(row._row);
  return { deleted: true, idIndex: idIndex };
};

A.listNews = function () {
  return strip_(readAll_('News').sort(byDesc_('published_at')));
};

A.upsertNews = function (payload) {
  var slug = requireText_(payload.slug, 'slug');
  var fields = {
    slug: slug,
    title: requireText_(payload.title, 'title'),
    excerpt: text_(payload.excerpt),
    body: text_(payload.body),
    cover_url: text_(payload.cover_url),
    cover_alt: text_(payload.cover_alt),
    published_at: text_(payload.published_at) || nowIso_(),
    status: payload.status === 'draft' ? 'draft' : 'published',
  };

  var existing = find_(readAll_('News'), function (row) {
    return row.slug === slug;
  });

  if (existing) {
    updateById_('News', existing.id, fields);
    return { id: existing.id, created: false };
  }

  var id = uuid_();
  fields.id = id;
  appendObject_('News', fields);
  return { id: id, created: true };
};

A.getSettings = function () {
  return settingsMap_();
};

A.updateSettings = function (payload) {
  return withLock_(function () {
    var values = payload.values || {};
    var updated = [];

    // Settings is a key/value tab without an id column, so write by key.
    var sheet = table_('Settings');
    var data = sheet.getDataRange().getValues();
    Object.keys(values).forEach(function (key) {
      var value = text_(values[key]);
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === key) {
          sheet.getRange(i + 1, 2).setValue(value);
          found = true;
          updated.push(key);
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, value]);
        updated.push(key);
      }
    });

    return { updated: updated, settings: settingsMap_() };
  });
};

/* ------------------------------------------------------------------ */
/* Auth / users                                                        */
/* ------------------------------------------------------------------ */

A.findUser = function (payload) {
  var identifier = requireText_(payload.cn, 'cn');
  var needle = identifier.toLowerCase();
  // The login form accepts either a control number or the account email.
  var row = find_(readAll_('Users'), function (item) {
    return (
      String(item.cn || '').toLowerCase() === needle ||
      String(item.email || '').toLowerCase() === needle
    );
  });
  return row ? stripOne_(row) : null;
};

/**
 * Sign-in happens here, on the server that owns the password hashes. It is a
 * public action: no API key is required, so a misconfigured secret can never
 * lock the owner out of the dashboard again.
 */
A.login = function (payload) {
  return withLock_(function () {
    var identifier = String(payload.identifier || payload.cn || '')
      .trim()
      .toLowerCase();
    var password = String(payload.password || '');
    if (!identifier || !password) {
      throw apiError_('BAD_REQUEST', 'Enter your control number and password');
    }

    var row = find_(readAll_('Users'), function (item) {
      return (
        String(item.cn || '').toLowerCase() === identifier ||
        String(item.email || '').toLowerCase() === identifier
      );
    });

    var generic = 'Incorrect control number/email or password.';
    if (!row || String(row.is_active || 'TRUE').toUpperCase() === 'FALSE') {
      throw apiError_('INVALID_CREDENTIALS', generic);
    }
    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      throw apiError_('LOCKED', 'Too many failed attempts. This account is locked for 15 minutes.');
    }
    if (!verifyPassword_(password, row.password_hash)) {
      A.registerFailure({ id: row.id });
      throw apiError_('INVALID_CREDENTIALS', generic);
    }

    A.clearFailures({ id: row.id });
    A.touchLogin({ id: row.id });

    return {
      id: row.id,
      cn: row.cn,
      full_name: row.full_name,
      email: row.email,
      role: row.role,
      must_change_password: row.must_change_password,
    };
  });
};

A.changePassword = function (payload) {
  return withLock_(function () {
    var identifier = String(payload.identifier || payload.cn || '')
      .trim()
      .toLowerCase();
    var current = String(payload.current || '');
    var next = String(payload.next || '');
    if (!identifier || !current || !next) throw apiError_('BAD_REQUEST', 'Fill in every field');

    var row = find_(readAll_('Users'), function (item) {
      return (
        String(item.cn || '').toLowerCase() === identifier ||
        String(item.email || '').toLowerCase() === identifier
      );
    });
    if (!row) throw apiError_('NOT_FOUND', 'Could not find your account.');
    if (!verifyPassword_(current, row.password_hash)) {
      throw apiError_('INVALID_CREDENTIALS', 'Current password is incorrect.');
    }
    if (next.length < 10) {
      throw apiError_('BAD_REQUEST', 'Password must be at least 10 characters');
    }

    updateById_('Users', row.id, {
      password_hash: hashPassword_(next),
      must_change_password: 'FALSE',
      failed_count: '0',
      locked_until: '',
    });
    return { updated: true };
  });
};

A.setOtp = function (payload) {
  var userId = requireText_(payload.user_id, 'user_id');
  var record = {
    id: uuid_(),
    user_id: userId,
    code_hash: requireText_(payload.code_hash, 'code_hash'),
    purpose: payload.purpose === 'reset' ? 'reset' : 'login',
    expires_at: requireText_(payload.expires_at, 'expires_at'),
    attempts: '0',
    consumed_at: '',
  };
  appendObject_('OtpCodes', record);
  return { id: record.id, expires_at: record.expires_at };
};

A.consumeOtp = function (payload) {
  return withLock_(function () {
    var userId = requireText_(payload.user_id, 'user_id');
    var codeHash = requireText_(payload.code_hash, 'code_hash');
    var now = nowIso_();
    var rows = readAll_('OtpCodes');
    var open = null;

    // Newest unconsumed code for this user.
    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i].user_id === userId && !rows[i].consumed_at) {
        open = rows[i];
        break;
      }
    }
    if (!open) return { valid: false };

    var expired = String(open.expires_at) < now;
    var exhausted = Number(open.attempts || 0) >= 5;
    if (expired || exhausted) {
      // Single use: burn the code so it cannot be retried.
      updateById_('OtpCodes', open.id, { consumed_at: now });
      return { valid: false };
    }

    if (String(open.code_hash) === codeHash) {
      updateById_('OtpCodes', open.id, { consumed_at: now });
      return { valid: true };
    }

    var attempts = Number(open.attempts || 0) + 1;
    var patch = { attempts: String(attempts) };
    if (attempts >= 5) patch.consumed_at = now;
    updateById_('OtpCodes', open.id, patch);
    return { valid: false };
  });
};

A.recordAttempt = function (payload) {
  appendObject_('LoginAttempts', {
    id: uuid_(),
    identifier: text_(payload.identifier),
    ip_hash: text_(payload.ip_hash),
    ua_hash: text_(payload.ua_hash),
    success: payload.success ? 'TRUE' : 'FALSE',
    created_at: nowIso_(),
  });
  return { recorded: true };
};

A.registerFailure = function (payload) {
  var user = requireText_(payload.id, 'id');
  var rows = readAll_('Users');
  var row = find_(rows, function (item) {
    return item.id === user;
  });
  if (!row) return { locked: false };

  var failed = Number(row.failed_count || 0) + 1;
  var patch = { failed_count: String(failed) };
  if (failed >= 5) {
    patch.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    patch.failed_count = '0';
  }
  updateById_('Users', user, patch);
  return { locked: failed >= 5, failed_count: failed };
};

A.clearFailures = function (payload) {
  var id = requireText_(payload.id, 'id');
  updateById_('Users', id, { failed_count: '0', locked_until: '' });
  return { cleared: true };
};

A.touchLogin = function (payload) {
  var id = requireText_(payload.id, 'id');
  updateById_('Users', id, { last_login_at: nowIso_() });
  return { touched: true };
};

A.setPasswordHash = function (payload) {
  var id = requireText_(payload.id, 'id');
  var hash = requireText_(payload.password_hash, 'password_hash');
  updateById_('Users', id, {
    password_hash: hash,
    must_change_password: 'FALSE',
    failed_count: '0',
    locked_until: '',
  });
  return { updated: true };
};

A.listUsers = function () {
  // password_hash is intentionally excluded from list results.
  return readAll_('Users').map(function (row) {
    return {
      id: row.id,
      cn: row.cn,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      otp_required: row.otp_required,
      is_active: row.is_active,
      must_change_password: row.must_change_password,
      locked_until: row.locked_until,
      last_login_at: row.last_login_at,
      created_at: row.created_at,
    };
  });
};

A.createUser = function (payload) {
  var cn = requireText_(payload.cn, 'cn');
  var existing = find_(readAll_('Users'), function (row) {
    return String(row.cn).toLowerCase() === cn.toLowerCase();
  });
  if (existing) throw apiError_('CONFLICT', 'That control number already exists');

  var record = {
    id: uuid_(),
    cn: cn,
    full_name: text_(payload.full_name),
    email: text_(payload.email).toLowerCase(),
    phone: text_(payload.phone),
    role: payload.role || 'Patient',
    // Plaintext is hashed here, so the Apps Script stays the only place that
    // can verify a password.
    password_hash: payload.password
      ? hashPassword_(String(payload.password))
      : requireText_(payload.password_hash, 'password_hash'),
    otp_required: payload.otp_required === false ? 'FALSE' : 'TRUE',
    is_active: 'TRUE',
    must_change_password: payload.must_change_password === false ? 'FALSE' : 'TRUE',
    failed_count: '0',
    locked_until: '',
    last_login_at: '',
    created_at: nowIso_(),
  };
  appendObject_('Users', record);
  return { id: record.id, cn: record.cn, role: record.role };
};

A.updateUser = function (payload) {
  var id = requireText_(payload.id, 'id');
  var patch = payload.patch || {};
  var allowed = ['full_name', 'email', 'phone', 'role', 'is_active', 'otp_required', 'must_change_password'];
  var clean = {};
  allowed.forEach(function (key) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) clean[key] = text_(patch[key]);
  });
  if (!Object.keys(clean).length) throw apiError_('BAD_REQUEST', 'Nothing to update');
  updateById_('Users', id, clean);
  return { updated: true };
};

/* ------------------------------------------------------------------ */
/* Inquiries / testimonials                                            */
/* ------------------------------------------------------------------ */

A.createInquiry = function (payload) {
  var record = {
    id: uuid_(),
    name: requireText_(payload.name, 'name'),
    email: text_(payload.email),
    phone: text_(payload.phone),
    subject: text_(payload.subject),
    message: requireText_(payload.message, 'message'),
    status: 'New',
    created_at: nowIso_(),
    handled_by: '',
    notes: '',
  };
  appendObject_('Inquiries', record);
  return { id: record.id };
};

A.listInquiries = function () {
  return strip_(readAll_('Inquiries').sort(byDesc_('created_at')));
};

A.updateInquiry = function (payload) {
  var id = requireText_(payload.id, 'id');
  var patch = {};
  if (payload.status) patch.status = text_(payload.status);
  if (payload.notes !== undefined) patch.notes = text_(payload.notes);
  if (payload.handled_by) patch.handled_by = text_(payload.handled_by);
  updateById_('Inquiries', id, patch);
  return { updated: true };
};

A.createTestimonial = function (payload) {
  var rating = Number(payload.rating);
  if (!(rating >= 1 && rating <= 5)) throw apiError_('BAD_REQUEST', 'Rating must be 1-5');
  var record = {
    id: uuid_(),
    patient_cn: requireText_(payload.patient_cn, 'patient_cn'),
    display_name: text_(payload.display_name),
    rating: String(Math.round(rating)),
    body: requireText_(payload.body, 'body'),
    status: 'Pending',
    created_at: nowIso_(),
    moderated_by: '',
    moderated_at: '',
  };
  appendObject_('Testimonials', record);
  return { id: record.id };
};

A.listTestimonials = function (payload) {
  var rows = readAll_('Testimonials').sort(byDesc_('created_at'));
  if (payload && payload.status) {
    rows = rows.filter(function (row) {
      return row.status === payload.status;
    });
  }
  if (payload && payload.patient_cn) {
    rows = rows.filter(function (row) {
      return row.patient_cn === payload.patient_cn;
    });
  }
  return strip_(rows);
};

A.moderateTestimonial = function (payload) {
  var id = requireText_(payload.id, 'id');
  var status = payload.status === 'Approved' ? 'Approved' : 'Rejected';
  updateById_('Testimonials', id, {
    status: status,
    moderated_by: text_(payload.moderated_by),
    moderated_at: nowIso_(),
  });
  return { updated: true, status: status };
};

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

A.listAppointments = function (payload) {
  var rows = readAll_('Appointments').sort(byAsc_('scheduled_at'));
  if (payload && payload.patient_cn) {
    rows = rows.filter(function (row) {
      return row.patient_cn === payload.patient_cn;
    });
  }
  if (payload && payload.status) {
    rows = rows.filter(function (row) {
      return row.status === payload.status;
    });
  }
  if (payload && payload.from) {
    rows = rows.filter(function (row) {
      return String(row.scheduled_at) >= payload.from;
    });
  }
  if (payload && payload.limit) rows = rows.slice(0, Number(payload.limit));
  return strip_(rows);
};

A.createAppointment = function (payload) {
  var record = {
    id: uuid_(),
    patient_cn: requireText_(payload.patient_cn, 'patient_cn'),
    scheduled_at: requireText_(payload.scheduled_at, 'scheduled_at'),
    duration_min: text_(payload.duration_min) || '180',
    chair: text_(payload.chair),
    status: payload.status || 'Requested',
    notes: text_(payload.notes),
    reminder_sent_at: '',
    created_at: nowIso_(),
    updated_at: nowIso_(),
  };
  appendObject_('Appointments', record);
  return { id: record.id };
};

A.updateAppointment = function (payload) {
  var id = requireText_(payload.id, 'id');
  var allowed = ['scheduled_at', 'duration_min', 'chair', 'status', 'notes', 'reminder_sent_at'];
  var patch = { updated_at: nowIso_() };
  allowed.forEach(function (key) {
    if (payload[key] !== undefined) patch[key] = text_(payload[key]);
  });
  updateById_('Appointments', id, patch);
  return { updated: true };
};

/* ------------------------------------------------------------------ */
/* Files                                                               */
/* ------------------------------------------------------------------ */

A.listFiles = function (payload) {
  var rows = readAll_('Files').sort(byDesc_('uploaded_at'));
  if (payload && payload.patient_cn) {
    rows = rows.filter(function (row) {
      return row.patient_cn === payload.patient_cn;
    });
  }
  if (payload && payload.category) {
    rows = rows.filter(function (row) {
      return row.category === payload.category;
    });
  }
  return strip_(rows);
};

A.registerFile = function (payload) {
  var record = {
    id: uuid_(),
    patient_cn: text_(payload.patient_cn),
    title: requireText_(payload.title, 'title'),
    category: payload.category === 'image' ? 'image' : 'lab',
    telegram_file_id: requireText_(payload.telegram_file_id, 'telegram_file_id'),
    telegram_message_id: text_(payload.telegram_message_id),
    mime: text_(payload.mime) || 'application/pdf',
    size_bytes: text_(payload.size_bytes) || '0',
    checksum_sha256: text_(payload.checksum_sha256),
    iv: text_(payload.iv),
    auth_tag: text_(payload.auth_tag),
    encrypted: payload.encrypted === false ? 'FALSE' : 'TRUE',
    uploaded_by: text_(payload.uploaded_by),
    uploaded_at: nowIso_(),
    released_at: payload.released_at || '',
    status: payload.status || 'Released',
  };
  appendObject_('Files', record);
  return { id: record.id };
};

A.releaseFile = function (payload) {
  var id = requireText_(payload.id, 'id');
  updateById_('Files', id, { status: 'Released', released_at: nowIso_() });
  return { released: true };
};

/* ------------------------------------------------------------------ */
/* Billing / queue / shifts                                            */
/* ------------------------------------------------------------------ */

A.listBilling = function (payload) {
  var rows = readAll_('Billing').sort(byDesc_('issued_at'));
  if (payload && payload.patient_cn) {
    rows = rows.filter(function (row) {
      return row.patient_cn === payload.patient_cn;
    });
  }
  return strip_(rows);
};

A.createBilling = function (payload) {
  var record = {
    id: uuid_(),
    patient_cn: requireText_(payload.patient_cn, 'patient_cn'),
    invoice_no: text_(payload.invoice_no) || 'INV-' + Date.now().toString().slice(-8),
    description: text_(payload.description),
    amount_php: text_(payload.amount_php) || '0',
    status: payload.status || 'Unpaid',
    issued_at: nowIso_(),
    paid_at: '',
    notes: text_(payload.notes),
  };
  appendObject_('Billing', record);
  return { id: record.id, invoice_no: record.invoice_no };
};

A.updateBilling = function (payload) {
  var id = requireText_(payload.id, 'id');
  var patch = {};
  if (payload.status) patch.status = text_(payload.status);
  if (payload.status === 'Paid') patch.paid_at = nowIso_();
  if (payload.notes !== undefined) patch.notes = text_(payload.notes);
  updateById_('Billing', id, patch);
  return { updated: true };
};

A.listQueue = function (payload) {
  var rows = readAll_('Queue');
  if (payload && payload.state) {
    rows = rows.filter(function (row) {
      return row.state === payload.state;
    });
  }
  return strip_(rows.sort(bySortOrder_('position')));
};

A.updateQueue = function (payload) {
  var id = requireText_(payload.id, 'id');
  var patch = { updated_at: nowIso_() };
  if (payload.state) patch.state = text_(payload.state);
  if (payload.position !== undefined) patch.position = text_(payload.position);
  if (payload.state === 'Ongoing') patch.started_at = nowIso_();
  if (payload.state === 'Completed') patch.completed_at = nowIso_();
  updateById_('Queue', id, patch);
  return { updated: true };
};

A.listShifts = function (payload) {
  var rows = readAll_('Shifts').sort(byAsc_('starts_at'));
  if (payload && payload.from) {
    rows = rows.filter(function (row) {
      return String(row.ends_at) >= payload.from;
    });
  }
  return strip_(rows);
};

A.createShift = function (payload) {
  var record = {
    id: uuid_(),
    staff_cn: requireText_(payload.staff_cn, 'staff_cn'),
    starts_at: requireText_(payload.starts_at, 'starts_at'),
    ends_at: requireText_(payload.ends_at, 'ends_at'),
    station: text_(payload.station),
    notes: text_(payload.notes),
    created_at: nowIso_(),
  };
  appendObject_('Shifts', record);
  return { id: record.id };
};

/* ------------------------------------------------------------------ */
/* Audit / analytics                                                   */
/* ------------------------------------------------------------------ */

A.appendAudit = function (payload) {
  var record = {
    id: uuid_(),
    actor_id: text_(payload.actor_id),
    actor_role: text_(payload.actor_role),
    action: requireText_(payload.action, 'action'),
    entity: text_(payload.entity),
    entity_id: text_(payload.entity_id),
    meta_json: payload.meta ? JSON.stringify(payload.meta).slice(0, 2000) : '',
    ip_hash: text_(payload.ip_hash),
    created_at: nowIso_(),
  };
  appendObject_('AuditLog', record);
  return { id: record.id };
};

A.listAudit = function (payload) {
  var rows = readAll_('AuditLog').sort(byDesc_('created_at'));
  var limit = payload && payload.limit ? Number(payload.limit) : 100;
  return strip_(rows.slice(0, limit));
};

A.analyticsSummary = function () {
  var users = readAll_('Users');
  var appointments = readAll_('Appointments');
  var testimonials = readAll_('Testimonials');
  var inquiries = readAll_('Inquiries');
  var billing = readAll_('Billing');
  var files = readAll_('Files');

  var month = nowIso_().slice(0, 7);
  var approved = testimonials.filter(function (row) {
    return row.status === 'Approved';
  });
  var ratingSum = approved.reduce(function (total, row) {
    return total + Number(row.rating || 0);
  }, 0);

  var revenue = billing
    .filter(function (row) {
      return row.status === 'Paid' && String(row.paid_at).slice(0, 7) === month;
    })
    .reduce(function (total, row) {
      return total + Number(row.amount_php || 0);
    }, 0);

  var byMonth = {};
  appointments.forEach(function (row) {
    var key = String(row.scheduled_at).slice(0, 7);
    if (!key) return;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });

  return {
    patients: users.filter(function (row) {
      return row.role === 'Patient';
    }).length,
    staff: users.filter(function (row) {
      return row.role !== 'Patient';
    }).length,
    appointmentsThisMonth: appointments.filter(function (row) {
      return String(row.scheduled_at).slice(0, 7) === month;
    }).length,
    upcoming: appointments.filter(function (row) {
      return String(row.scheduled_at) >= nowIso() && row.status !== 'Cancelled';
    }).length,
    pendingTestimonials: testimonials.filter(function (row) {
      return row.status === 'Pending';
    }).length,
    newInquiries: inquiries.filter(function (row) {
      return row.status === 'New';
    }).length,
    averageRating: approved.length ? Math.round((ratingSum / approved.length) * 10) / 10 : 0,
    files: files.length,
    revenueThisMonth: revenue,
    appointmentsByMonth: byMonth,
  };
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function text_(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function requireText_(value, field) {
  var clean = text_(value);
  if (!clean) throw apiError_('BAD_REQUEST', 'Missing field: ' + field);
  return clean;
}

function find_(rows, predicate) {
  for (var i = 0; i < rows.length; i++) {
    if (predicate(rows[i])) return rows[i];
  }
  return null;
}

function published_(rows) {
  return rows.filter(function (row) {
    return row.status === 'published' || row.status === '' || row.status === undefined;
  });
}

function strip_(rows) {
  return rows.map(stripOne_);
}

function stripOne_(row) {
  var out = {};
  Object.keys(row).forEach(function (key) {
    if (key.charAt(0) === '_') return;
    out[key] = row[key];
  });
  return out;
}

function bySortOrder_(key) {
  return function (a, b) {
    return Number(a[key] || 0) - Number(b[key] || 0);
  };
}

function byDesc_(key) {
  return function (a, b) {
    var x = String(a[key] || '');
    var y = String(b[key] || '');
    if (x === y) return 0;
    return x < y ? 1 : -1;
  };
}

function byAsc_(key) {
  return function (a, b) {
    var x = String(a[key] || '');
    var y = String(b[key] || '');
    if (x === y) return 0;
    return x < y ? -1 : 1;
  };
}

function settingsMap_() {
  var out = {};
  readAll_('Settings').forEach(function (row) {
    if (!row.key) return;
    out[row.key] = row.value === undefined || row.value === null ? '' : String(row.value);
  });
  return out;
}
