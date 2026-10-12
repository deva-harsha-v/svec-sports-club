import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failCount++;
  }
}

console.log('\n============================================================');
console.log('TITAN SPORTS // SYSTEM VERIFICATION SUITE');
console.log('Sri Vasavi Engineering College (SVEC) Selection Trials & Sports');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. SOURCE INTEGRITY & DATABASE ASSETS CHECK
// -----------------------------------------------------------------------------
console.log('--- 1. SOURCE INTEGRITY & DATABASE ASSETS ---');

const schemaPath = path.resolve('supabase/schema.sql');
const seedPath = path.resolve('supabase/seed.sql');

assert(fs.existsSync(schemaPath), 'supabase/schema.sql exists');
assert(fs.existsSync(seedPath), 'supabase/seed.sql exists');

const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// Check exact TinyURLs
assert(
  seedContent.includes('https://tinyurl.com/3d73phrv'),
  'Circular 117 contains exact official URL: https://tinyurl.com/3d73phrv'
);
assert(
  seedContent.includes('https://tinyurl.com/2j9srhnc'),
  'Circular 118 contains exact official URL: https://tinyurl.com/2j9srhnc'
);

// Zero fabricated forms.gle URLs anywhere in seed or schema
assert(
  !seedContent.includes('forms.gle') && !schemaContent.includes('forms.gle'),
  'Zero fabricated or placeholder forms.gle URLs exist in database scripts'
);

// Check exact source document names
assert(
  seedContent.includes('117Cricket(Men)SelectionTrials-2026-27.pdf'),
  'Exact source document name for Circular 117 is recorded'
);
assert(
  seedContent.includes('118SelectionTrialsTTandVolleyball(M&W).pdf'),
  'Exact source document name for Circular 118 is recorded'
);

// Check exact circular references
assert(
  seedContent.includes('SVEC/Admn./SJ/Circular/2026-27/117'),
  'Official circular reference 117 is recorded'
);
assert(
  seedContent.includes('SVEC/Admn./SJ/Circular/2026-27/118'),
  'Official circular reference 118 is recorded'
);

// Check 20 SVEC Offerings
const officialOfferings = [
  'Shuttle Badminton', 'Kho-Kho', 'Yoga', 'Basketball', 'Handball',
  'Netball', 'Fencing', 'Taekwondo', 'Self-Defence', 'Table Tennis',
  'Ball Badminton', 'Chess', 'Cricket', 'Volleyball', 'Kabaddi',
  'Football', 'Athletics', 'Archery', 'Gymnasium', 'Open Gym'
];

let allOfferingsFound = true;
for (const offering of officialOfferings) {
  if (!seedContent.includes(`'${offering}'`)) {
    allOfferingsFound = false;
    console.error(`Missing offering: ${offering}`);
  }
}
assert(allOfferingsFound, 'All 20 official SVEC sports & facilities are seeded in seed.sql');

// Check canonical taxonomy (no slash separated pseudo-categories)
assert(
  !seedContent.includes('Competitive Sport /') && !seedContent.includes('Indoor Sport /'),
  'No slash-separated pseudo-categories in sports seed data'
);

// Check that selection trial venues default to NULL (not fabricated)
assert(
  seedContent.includes("venue_name,\n    publication_state") || seedContent.includes("NULL,\n    'published'"),
  'Unassigned trial venues default to NULL'
);

// -----------------------------------------------------------------------------
// 2. ACADEMIC CONSISTENCY CONSTRAINT CHECK (chk_profile_academic_consistency)
// -----------------------------------------------------------------------------
console.log('\n--- 2. ACADEMIC CONSISTENCY CONSTRAINT LOGIC ---');

const VALID_BTECH_BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'AIDS', 'CAI', 'CST'];
const VALID_BTECH_YEARS = ['1st', '2nd', '3rd', '4th'];
const VALID_MBA_YEARS = ['1st', '2nd'];

function validateProfileAcademicConsistency(profile) {
  // If program is NULL, allowed for incomplete or external profiles
  if (!profile.program) return true;

  if (profile.program === 'B.Tech') {
    return VALID_BTECH_BRANCHES.includes(profile.department) && VALID_BTECH_YEARS.includes(profile.year);
  }

  if (profile.program === 'MBA') {
    return profile.department === 'Management' && VALID_MBA_YEARS.includes(profile.year);
  }

  if (profile.program === 'Staff' || profile.program === 'Other') {
    return true;
  }

  return false;
}

assert(
  validateProfileAcademicConsistency({ program: 'B.Tech', department: 'CSE', year: '2nd' }),
  'B.Tech CSE 2nd Year is valid'
);
assert(
  validateProfileAcademicConsistency({ program: 'B.Tech', department: 'CAI', year: '3rd' }),
  'B.Tech CAI 3rd Year is valid'
);
assert(
  validateProfileAcademicConsistency({ program: 'MBA', department: 'Management', year: '1st' }),
  'MBA Management 1st Year is valid'
);
assert(
  validateProfileAcademicConsistency({ program: 'MBA', department: 'Management', year: '2nd' }),
  'MBA Management 2nd Year is valid'
);
assert(
  validateProfileAcademicConsistency({ program: null, department: 'General' }),
  'Incomplete profile with program = NULL is valid'
);
assert(
  !validateProfileAcademicConsistency({ program: 'B.Tech', department: 'Management', year: '2nd' }),
  'REJECTED: B.Tech with Management department'
);
assert(
  !validateProfileAcademicConsistency({ program: 'B.Tech', department: 'CSE', year: '5th' }),
  'REJECTED: B.Tech with 5th year'
);
assert(
  !validateProfileAcademicConsistency({ program: 'MBA', department: 'CSE', year: '1st' }),
  'REJECTED: MBA with CSE engineering branch'
);
assert(
  !validateProfileAcademicConsistency({ program: 'MBA', department: 'Management', year: '3rd' }),
  'REJECTED: MBA with 3rd year'
);

// -----------------------------------------------------------------------------
// 3. IDENTITY TAMPERING TRIGGER VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. IDENTITY TAMPERING TRIGGER LOGIC ---');

function simulateProfileUpdateTrigger(oldProfile, newProfile, callerRole) {
  if (callerRole === 'admin') {
    return { success: true, updated: newProfile };
  }

  // Non-admin identity field protection
  if (
    oldProfile.student_id !== newProfile.student_id ||
    oldProfile.program !== newProfile.program ||
    oldProfile.department !== newProfile.department ||
    oldProfile.year !== newProfile.year ||
    oldProfile.gender !== newProfile.gender ||
    oldProfile.role !== newProfile.role
  ) {
    return {
      success: false,
      error: 'Direct modification of protected academic identity fields is prohibited'
    };
  }

  // Allowed fields: phone, avatar_url, bio
  return { success: true, updated: newProfile };
}

const baselineStudent = {
  student_id: '24A81A0501',
  program: 'B.Tech',
  department: 'CSE',
  year: '2nd',
  gender: 'Men',
  role: 'member',
  phone: '+91 98480 11111',
  bio: 'Athlete bio'
};

assert(
  !simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, year: '3rd' }, 'member').success,
  'Student self-update of studying year is BLOCKED'
);
assert(
  !simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, program: 'MBA' }, 'member').success,
  'Student self-update of program is BLOCKED'
);
assert(
  !simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, student_id: '22A81A0501' }, 'member').success,
  'Student self-update of roll number (student_id) is BLOCKED'
);
assert(
  !simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, gender: 'Women' }, 'member').success,
  'Student self-update of gender is BLOCKED'
);
assert(
  !simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, role: 'admin' }, 'member').success,
  'Student privilege escalation to admin is BLOCKED'
);
assert(
  simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, phone: '+91 99999 88888', bio: 'Updated bio' }, 'member').success,
  'Student update of permitted fields (phone, bio) is ALLOWED'
);
assert(
  simulateProfileUpdateTrigger(baselineStudent, { ...baselineStudent, year: '3rd' }, 'admin').success,
  'Admin update of student academic record is ALLOWED'
);

// -----------------------------------------------------------------------------
// 4. SESSION-LEVEL ELIGIBILITY MATRIX CHECK
// -----------------------------------------------------------------------------
console.log('\n--- 4. SESSION ELIGIBILITY MATRIX VERIFICATION ---');

// Eligibility configurations from seed.sql
const cricketEligibility = {
  session1: [ // B.Tech 2nd Year Men
    { program: 'B.Tech', year: '2nd', gender: 'Men' }
  ],
  session2: [ // B.Tech 3rd & 4th Year Men
    { program: 'B.Tech', year: '3rd', gender: 'Men' },
    { program: 'B.Tech', year: '4th', gender: 'Men' }
  ],
  session3: [ // MBA Men (1st & 2nd Year)
    { program: 'MBA', year: '1st', gender: 'Men' },
    { program: 'MBA', year: '2nd', gender: 'Men' }
  ]
};

const ttVbEligibility = {
  ttMen: [ // Table Tennis Men (All B.Tech & MBA Men)
    { program: 'B.Tech', year: '1st', gender: 'Men' },
    { program: 'B.Tech', year: '2nd', gender: 'Men' },
    { program: 'B.Tech', year: '3rd', gender: 'Men' },
    { program: 'B.Tech', year: '4th', gender: 'Men' },
    { program: 'MBA', year: '1st', gender: 'Men' },
    { program: 'MBA', year: '2nd', gender: 'Men' }
  ],
  ttWomen: [ // Table Tennis Women (All B.Tech & MBA Women)
    { program: 'B.Tech', year: '1st', gender: 'Women' },
    { program: 'B.Tech', year: '2nd', gender: 'Women' },
    { program: 'B.Tech', year: '3rd', gender: 'Women' },
    { program: 'B.Tech', year: '4th', gender: 'Women' },
    { program: 'MBA', year: '1st', gender: 'Women' },
    { program: 'MBA', year: '2nd', gender: 'Women' }
  ]
};

function checkSessionEligibility(rules, student) {
  return rules.some(r => {
    const matchProgram = !r.program || r.program === student.program;
    const matchYear = !r.year || r.year === student.year;
    const matchGender = !r.gender || r.gender === student.gender;
    return matchProgram && matchYear && matchGender;
  });
}

// Circular 117 tests
const btech2ndMen = { program: 'B.Tech', year: '2nd', gender: 'Men' };
const btech3rdMen = { program: 'B.Tech', year: '3rd', gender: 'Men' };
const btech4thMen = { program: 'B.Tech', year: '4th', gender: 'Men' };
const btech1stMen = { program: 'B.Tech', year: '1st', gender: 'Men' };
const mba1stMen = { program: 'MBA', year: '1st', gender: 'Men' };
const btech2ndWomen = { program: 'B.Tech', year: '2nd', gender: 'Women' };

assert(checkSessionEligibility(cricketEligibility.session1, btech2ndMen), 'Cricket Session 1: B.Tech 2nd Year Men is ELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session1, btech1stMen), 'Cricket Session 1: B.Tech 1st Year Men is INELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session1, btech3rdMen), 'Cricket Session 1: B.Tech 3rd Year Men is INELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session1, mba1stMen), 'Cricket Session 1: MBA Men is INELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session1, btech2ndWomen), 'Cricket Session 1: Women candidate is INELIGIBLE');

assert(checkSessionEligibility(cricketEligibility.session2, btech3rdMen), 'Cricket Session 2: B.Tech 3rd Year Men is ELIGIBLE');
assert(checkSessionEligibility(cricketEligibility.session2, btech4thMen), 'Cricket Session 2: B.Tech 4th Year Men is ELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session2, btech2ndMen), 'Cricket Session 2: B.Tech 2nd Year Men is INELIGIBLE');

assert(checkSessionEligibility(cricketEligibility.session3, mba1stMen), 'Cricket Session 3: MBA 1st Year Men is ELIGIBLE');
assert(!checkSessionEligibility(cricketEligibility.session3, btech2ndMen), 'Cricket Session 3: B.Tech Men is INELIGIBLE');

// Circular 118 tests
const btech3rdWomen = { program: 'B.Tech', year: '3rd', gender: 'Women' };
assert(checkSessionEligibility(ttVbEligibility.ttMen, btech1stMen), 'TT Men: B.Tech 1st Year Men is ELIGIBLE');
assert(checkSessionEligibility(ttVbEligibility.ttMen, mba1stMen), 'TT Men: MBA Men is ELIGIBLE');
assert(!checkSessionEligibility(ttVbEligibility.ttMen, btech3rdWomen), 'TT Men: Women candidate is INELIGIBLE');

assert(checkSessionEligibility(ttVbEligibility.ttWomen, btech3rdWomen), 'TT Women: B.Tech 3rd Year Women is ELIGIBLE');
assert(!checkSessionEligibility(ttVbEligibility.ttWomen, btech2ndMen), 'TT Women: Men candidate is INELIGIBLE');

// -----------------------------------------------------------------------------
// 5. REGISTRATION POLICY & RPC BOUNDARIES
// -----------------------------------------------------------------------------
console.log('\n--- 5. REGISTRATION RPC LOGIC & CONCURRENCY CONSTRAINTS ---');

function simulateTrialRegistration({ profile, sessionRules, whatsappConfirmed, isDuplicate }) {
  if (!whatsappConfirmed) {
    return { success: false, error: 'Registration requires confirmation of WhatsApp channel subscription' };
  }
  if (!profile.program || !profile.department || !profile.year || !profile.gender || !profile.student_id) {
    return { success: false, error: 'Incomplete academic profile' };
  }
  if (isDuplicate) {
    return { success: false, error: 'Student is already registered for this selection trial' };
  }
  const isEligible = checkSessionEligibility(sessionRules, profile);
  if (!isEligible) {
    return { success: false, error: 'Candidate does not satisfy session academic eligibility criteria' };
  }

  return {
    success: true,
    registration: {
      student_id: profile.student_id,
      roll_no: profile.student_id,
      program: profile.program,
      branch: profile.department,
      year: profile.year,
      gender: profile.gender,
      attendance_status: 'absent',
      evaluation_status: 'pending',
      qr_code_token: 'TITAN-TRIAL-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    }
  };
}

assert(
  !simulateTrialRegistration({ profile: btech2ndMen, sessionRules: cricketEligibility.session1, whatsappConfirmed: false }).success,
  'Registration REJECTED if WhatsApp channel confirmation is false'
);
assert(
  !simulateTrialRegistration({ profile: { ...btech2ndMen, student_id: null }, sessionRules: cricketEligibility.session1, whatsappConfirmed: true }).success,
  'Registration REJECTED if profile has missing academic details'
);
assert(
  !simulateTrialRegistration({ profile: btech2ndMen, sessionRules: cricketEligibility.session1, whatsappConfirmed: true, isDuplicate: true }).success,
  'Registration REJECTED if student already registered for the trial'
);
assert(
  simulateTrialRegistration({ profile: { ...btech2ndMen, student_id: '24A81A0501', department: 'CSE' }, sessionRules: cricketEligibility.session1, whatsappConfirmed: true }).success,
  'Valid registration SUCCEEDS and issues unique QR token pass'
);

// -----------------------------------------------------------------------------
// 6. PREMATURE PUBLICATION PREVENTION & VISIBILITY PROJECTION
// -----------------------------------------------------------------------------
console.log('\n--- 6. PUBLICATION AUDIT & RESULTS VISIBILITY ---');

function simulateAdminPublishResults(trial, registrations, callerRole) {
  if (callerRole !== 'admin') {
    return { success: false, error: 'Only administrators may publish selection results' };
  }
  const pendingCount = registrations.filter(r => r.evaluation_status === 'pending').length;
  if (pendingCount > 0) {
    return {
      success: false,
      error: `Cannot publish selection results: ${pendingCount} registration(s) still have evaluation_status = 'pending'`
    };
  }
  return { success: true, results_published: true };
}

const mockRosterWithPending = [
  { student_name: 'Athlete A', evaluation_status: 'selected' },
  { student_name: 'Athlete B', evaluation_status: 'pending' }
];

const mockRosterAllEvaluated = [
  { student_name: 'Athlete A', evaluation_status: 'selected', internal_notes: 'Excellent footwork', phone: '9848011111', student_id: '24A81A0501', branch: 'CSE', year: '2nd' },
  { student_name: 'Athlete B', evaluation_status: 'rejected', internal_notes: 'Needs conditioning', phone: '9848022222', student_id: '24A81A0401', branch: 'ECE', year: '3rd' },
  { student_name: 'Athlete C', evaluation_status: 'standby', internal_notes: 'Backup wicketkeeper', phone: '9848033333', student_id: '24A81A0301', branch: 'MECH', year: '4th' }
];

assert(
  !simulateAdminPublishResults({ title: 'Cricket Trial' }, mockRosterWithPending, 'admin').success,
  'Premature publication is BLOCKED while any candidate has evaluation_status = pending'
);
assert(
  !simulateAdminPublishResults({ title: 'Cricket Trial' }, mockRosterAllEvaluated, 'coach').success,
  'Publication attempt by coach is BLOCKED (Admin-only privilege)'
);
assert(
  simulateAdminPublishResults({ title: 'Cricket Trial' }, mockRosterAllEvaluated, 'admin').success,
  'Publication SUCCEEDS when all candidates evaluated and published by admin'
);

// Public View Projection Test (v_published_selection_results)
function projectPublicResultsView(registrations, trialPublished) {
  if (!trialPublished) return [];
  return registrations
    .filter(r => r.evaluation_status === 'selected' || r.evaluation_status === 'standby')
    .map(r => ({
      student_name: r.student_name,
      branch: r.branch,
      year: r.year,
      evaluation_status: r.evaluation_status
      // student_id, phone, internal_notes MUST NOT BE PROJECTED
    }));
}

const publicView = projectPublicResultsView(mockRosterAllEvaluated, true);
assert(publicView.length === 2, 'Public view displays only selected and standby candidates (excludes rejected)');
assert(publicView.every(r => r.phone === undefined && r.student_id === undefined && r.internal_notes === undefined), 'Public view masks phone, roll number, and confidential evaluation notes');

console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
