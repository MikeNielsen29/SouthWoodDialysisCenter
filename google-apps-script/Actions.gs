/**
 * CloudBase DB — action handlers
 * ------------------------------
 * Every handler receives (payload, actor) and returns plain JSON-safe data.
 * Authorization for end users happens in the Next.js layer; this script only
 * enforces that calls are signed, that writes are serialised, and that no
 * handler returns password material or another patient's rows unless asked.
 *
 * Naming: keys of `A` are referenced by ACTIONS in Code.gs.
 */

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
    password_hash: requireText_(payload.password_hash, 'password_hash'),
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
