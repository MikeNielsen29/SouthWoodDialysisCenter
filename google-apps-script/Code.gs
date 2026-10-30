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
  MAX_SKEW_SECONDS: 300,
  NONCE_TTL_SECONDS: 600,
  SCHEMA_VERSION: '1',
  META_TAB: '_Meta',
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

function doGet() {
  return json_({
    ok: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
  });
}

function doPost(e) {
  var started = Date.now();
  try {
    var raw = e && e.postData ? e.postData.contents : '';
    if (!raw) throw apiError_('BAD_REQUEST', 'Empty request body');

    var body;
    try {
      body = JSON.parse(raw);
    } catch (parseError) {
      throw apiError_('BAD_REQUEST', 'Malformed JSON');
    }

    if (!body || typeof body.action !== 'string') {
      throw apiError_('BAD_REQUEST', 'Missing action');
    }

    authorize_(body);

    var handler = ACTIONS[body.action];
    if (!handler) throw apiError_('UNKNOWN_ACTION', 'Unknown action');

    var data = handler(body.payload || {}, body.actor || null) || {};
    return json_({ ok: true, data: data, meta: { action: body.action, ms: Date.now() - started } });
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
};

/* ------------------------------------------------------------------ */
/* Auth / signing                                                      */
/* ------------------------------------------------------------------ */

function authorize_(body) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty(CFG.SECRET_PROP);
  if (!secret) throw apiError_('NOT_CONFIGURED', 'Script properties are missing');

  var auth = body.auth;
  if (!auth || !auth.key || !auth.ts || !auth.nonce || !auth.sig) {
    throw apiError_('UNAUTHORIZED', 'Missing credentials');
  }
  if (!constantTimeEquals_(String(auth.key), secret)) {
    throw apiError_('UNAUTHORIZED', 'Invalid credentials');
  }

  var now = Math.floor(Date.now() / 1000);
  var ts = Number(auth.ts);
  if (!isFinite(ts) || Math.abs(now - ts) > CFG.MAX_SKEW_SECONDS) {
    throw apiError_('EXPIRED', 'Request expired');
  }

  var expected = sign_(secret, auth.ts, body.action, body.payload || {});
  if (!constantTimeEquals_(expected, String(auth.sig))) {
    throw apiError_('UNAUTHORIZED', 'Invalid signature');
  }

  var cache = CacheService.getScriptCache();
  var nonceKey = 'nonce:' + auth.nonce;
  if (cache.get(nonceKey)) throw apiError_('REPLAY', 'Duplicate request');
  cache.put(nonceKey, '1', CFG.NONCE_TTL_SECONDS);
}

function sign_(secret, ts, action, payload) {
  var input = String(ts) + '\n' + String(action) + '\n' + canonical_(payload);
  var bytes = Utilities.computeHmacSha256Signature(input, secret);
  return bytesToHex_(bytes);
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

    seedSettings_(ss);
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
    };
  });
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
    .addItem('Health check', 'menuHealth')
    .addItem('Backup now', 'menuBackup')
    .addToUi();
}

function menuSetup() {
  var result = setup_();
  SpreadsheetApp.getUi().alert(
    'Setup complete\n\nCreated: ' +
      (result.created.join(', ') || 'none') +
      '\nExisting: ' +
      (result.existing.length ? result.existing.length + ' tabs' : 'none') +
      '\nSchema version: ' +
      result.schemaVersion
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
      (result.configured.sharedSecret ? 'yes' : 'NO — set GS_SHARED_SECRET') +
      '\n\n' +
      lines.join('\n')
  );
}

function menuBackup() {
  var result = backup_();
  SpreadsheetApp.getUi().alert('Backup created: ' + result.name);
}
