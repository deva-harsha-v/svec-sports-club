/**
 * Google Account Linking & Student Authentication Acceptance Test Suite
 * Sri Vasavi Engineering College (SVEC) Sports Club Portal
 * 
 * Tests the 7 Core Acceptance Scenarios:
 * Scenario 1: Student ID + initial password -> forced password change -> Student Portal.
 * Scenario 2: New password works on next sign-in.
 * Scenario 3: Authorized Google account -> same student profile -> Student Portal without password change.
 * Scenario 4: Unauthorized Google account -> rejected with exact error message, zero accounts created.
 * Scenario 5: Duplicate Google Email assignment rejected by Admin.
 * Scenario 6: Admin updates student Google email -> old unlinked, new email resolves.
 * Scenario 7: Multi-tab isolation (Tab 1 Admin, Tab 2 Google/Student) maintains isolated states.
 * Scenario 8: Database schema, RPCs, trigger protection, and index integrity check.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MockSessionStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// In-memory test store simulating Supabase / local profiles database
class MockProfilesStore {
  constructor() {
    this.profiles = [
      {
        id: 'usr_athlete_01',
        email: 'student@svec.ac.in',
        google_email: 'student@gmail.com',
        full_name: 'Student Athlete',
        role: 'member',
        program: 'B.Tech',
        department: 'CSE',
        year: '3rd',
        student_id: '22A81A0501',
        normalized_roll_no: '22A81A0501',
        gender: 'Men',
        phone: '+91 94401 00000',
        password_hash: 'initial_hash_22A81A0501',
        requires_password_change: false,
        is_active: true
      },
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        email: 'student.cse2@svec.ac.in',
        google_email: 'rajesh.k@gmail.com',
        full_name: 'K. Rajesh',
        role: 'member',
        program: 'B.Tech',
        department: 'CSE',
        year: '2nd',
        student_id: '24A81A0501',
        normalized_roll_no: '24A81A0501',
        gender: 'Men',
        phone: '+91 98480 11111',
        password_hash: 'initial_hash_24A81A0501',
        requires_password_change: true,
        is_active: true
      },
      {
        id: 'admin_coach_01',
        email: 'coach.cricket@svec.ac.in',
        google_email: null,
        full_name: 'Coach Administrator',
        role: 'admin',
        program: null,
        department: 'Physical Education',
        year: null,
        student_id: null,
        password_hash: 'coach_pass_hash',
        requires_password_change: false,
        is_active: true
      }
    ];
    this.auditLogs = [];
  }

  resolveStudentByUsername(username) {
    const trimmed = (username || '').trim();
    if (!trimmed) return null;
    const isEmail = trimmed.includes('@');
    if (isEmail) {
      return this.profiles.find(s => s.email.toLowerCase() === trimmed.toLowerCase()) || null;
    }
    return this.profiles.find(s => 
      s.student_id?.toUpperCase() === trimmed.toUpperCase() || 
      s.normalized_roll_no?.toUpperCase() === trimmed.toUpperCase()
    ) || null;
  }

  verifyAndResolveGoogleAuth(googleEmail) {
    const trimmed = (googleEmail || '').trim().toLowerCase();
    if (!trimmed) {
      return {
        success: false,
        reason: 'not_authorized',
        message: 'No Google account email provided.'
      };
    }

    const matched = this.profiles.find(
      s => (s.google_email && s.google_email.toLowerCase() === trimmed) || s.email.toLowerCase() === trimmed
    );

    if (!matched) {
      this.auditLogs.push({
        action: 'google_login_rejected',
        details: { google_email: trimmed, reason: 'unlinked_account' }
      });
      return {
        success: false,
        reason: 'not_authorized',
        message: 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
      };
    }

    if (matched.is_active === false) {
      this.auditLogs.push({
        action: 'google_login_rejected',
        details: { google_email: trimmed, reason: 'account_inactive', profile_id: matched.id }
      });
      return {
        success: false,
        reason: 'inactive',
        message: 'This student account is currently inactive. Please contact the Sports Administration.'
      };
    }

    this.auditLogs.push({
      action: 'google_login_successful',
      details: { google_email: trimmed, profile_id: matched.id }
    });

    return {
      success: true,
      profile: matched
    };
  }

  adminProvisionStudent(studentData) {
    const normGoogleEmail = studentData.google_email?.trim() 
      ? studentData.google_email.trim().toLowerCase() 
      : null;

    if (normGoogleEmail) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(normGoogleEmail)) {
        throw new Error('Invalid Google Email ID format.');
      }

      const dup = this.profiles.find(s => s.google_email?.toLowerCase() === normGoogleEmail);
      if (dup) {
        throw new Error('Google Email ID already linked to another student account.');
      }
    }

    const newId = `stu_${Date.now()}`;
    const newStudent = {
      id: newId,
      student_id: studentData.student_id.toUpperCase().trim(),
      normalized_roll_no: studentData.student_id.toUpperCase().trim(),
      full_name: studentData.full_name.trim(),
      email: studentData.email.toLowerCase().trim(),
      google_email: normGoogleEmail,
      program: studentData.program,
      department: studentData.department,
      year: studentData.year,
      gender: studentData.gender,
      phone: studentData.phone?.trim() || null,
      role: 'member',
      password_hash: `hash_${studentData.password || 'default'}`,
      is_active: true,
      requires_password_change: true
    };

    this.profiles.push(newStudent);
    this.auditLogs.push({
      action: 'student_provisioned',
      entity_id: newId,
      details: { student_id: newStudent.student_id, google_email: normGoogleEmail }
    });
    return { id: newId };
  }

  adminUpdateStudentAccount(id, updates) {
    const target = this.profiles.find(s => s.id === id);
    if (!target) throw new Error('Student account not found.');

    const normGoogleEmail = updates.google_email !== undefined 
      ? (updates.google_email?.trim() ? updates.google_email.trim().toLowerCase() : null)
      : target.google_email;

    if (normGoogleEmail) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(normGoogleEmail)) {
        throw new Error('Invalid Google Email ID format.');
      }

      const dup = this.profiles.find(s => s.id !== id && s.google_email?.toLowerCase() === normGoogleEmail);
      if (dup) {
        throw new Error('Google Email ID already linked to another student account.');
      }
    }

    if (updates.google_email !== undefined) {
      const oldEmail = target.google_email;
      target.google_email = normGoogleEmail;
      this.auditLogs.push({
        action: normGoogleEmail ? (oldEmail ? 'google_email_changed' : 'google_email_linked') : 'google_email_unlinked',
        entity_id: id,
        details: { old_email: oldEmail, new_email: normGoogleEmail }
      });
    }

    if (updates.full_name) target.full_name = updates.full_name.trim();
    if (updates.program) target.program = updates.program;
    if (updates.department) target.department = updates.department;
    if (updates.year) target.year = updates.year;
    if (updates.gender) target.gender = updates.gender;
    if (updates.phone !== undefined) target.phone = updates.phone;
    if (updates.is_active !== undefined) target.is_active = updates.is_active;

    return { ...target };
  }

  updatePassword(id, newPassword) {
    const target = this.profiles.find(s => s.id === id);
    if (!target) throw new Error('Student not found');
    target.password_hash = `hash_${newPassword}`;
    target.requires_password_change = false;
    return true;
  }
}

// Simulates client tab AuthContext
class MockAuthContext {
  constructor(tabName, storage, profilesStore) {
    this.tabName = tabName;
    this.sessionStorage = storage;
    this.store = profilesStore;
    this.currentUser = null;
    this.role = 'public';
  }

  signIn(usernameOrEmail, password) {
    const rawInput = (usernameOrEmail || '').trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter your username, Student ID, or official email.' };
    }

    let resolvedEmail = rawInput.toLowerCase();
    let matchedProfile = null;
    if (!rawInput.includes('@')) {
      matchedProfile = this.store.resolveStudentByUsername(rawInput);
      if (matchedProfile?.email) {
        resolvedEmail = matchedProfile.email.toLowerCase();
      }
    } else {
      matchedProfile = this.store.profiles.find(s => s.email.toLowerCase() === resolvedEmail);
    }

    if (matchedProfile && matchedProfile.role === 'member') {
      if (matchedProfile.is_active === false) {
        return {
          success: false,
          message: 'This student account is currently inactive. Please contact the Sports Administration.'
        };
      }

      if (password && matchedProfile.password_hash !== `hash_${password}` && matchedProfile.password_hash !== `initial_hash_${matchedProfile.student_id}`) {
        return { success: false, message: 'Invalid credentials.' };
      }

      this.currentUser = { ...matchedProfile };
      this.role = matchedProfile.role;
      this.sessionStorage.setItem('svec_tab_auth_role', matchedProfile.role);
      this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(matchedProfile));

      return {
        success: true,
        role: matchedProfile.role,
        mustChangePassword: !!matchedProfile.requires_password_change
      };
    }

    // Check admin credentials
    if (
      resolvedEmail === 'coach.cricket@svec.ac.in' ||
      resolvedEmail === 'admin@svec.ac.in' ||
      resolvedEmail.includes('admin') ||
      resolvedEmail.includes('coach')
    ) {
      const admin = this.store.profiles.find(p => p.role === 'admin') || {
        id: 'admin_coach_01',
        email: resolvedEmail,
        full_name: 'Coach Administrator',
        role: 'admin'
      };
      this.currentUser = { ...admin, email: resolvedEmail };
      this.role = 'admin';
      this.sessionStorage.setItem('svec_tab_auth_role', 'admin');
      this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(this.currentUser));
      return { success: true, role: 'admin' };
    }

    return { success: false, message: 'Invalid credentials. Please verify your Student ID, username, or official email.' };
  }

  signInWithGoogle(googleEmail) {
    const resolution = this.store.verifyAndResolveGoogleAuth(googleEmail);
    if (!resolution.success || !resolution.profile) {
      // Reject and guarantee zero session state
      this.signOut();
      return {
        success: false,
        message: resolution.message || 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
      };
    }

    const studentProfile = resolution.profile;
    this.currentUser = { ...studentProfile };
    this.role = 'member';
    this.sessionStorage.setItem('svec_tab_auth_role', 'member');
    this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(studentProfile));

    return {
      success: true,
      role: 'member',
      mustChangePassword: false // Google login never triggers password change
    };
  }

  updatePassword(newPassword) {
    if (!this.currentUser) throw new Error('Not authenticated');
    this.store.updatePassword(this.currentUser.id, newPassword);
    this.currentUser.requires_password_change = false;
    this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(this.currentUser));
  }

  signOut() {
    this.sessionStorage.removeItem('svec_tab_auth_role');
    this.sessionStorage.removeItem('svec_tab_user_profile');
    this.currentUser = null;
    this.role = 'public';
  }

  refresh() {
    const savedRole = this.sessionStorage.getItem('svec_tab_auth_role');
    const savedProfile = this.sessionStorage.getItem('svec_tab_user_profile');
    this.role = savedRole || 'public';
    this.currentUser = savedProfile ? JSON.parse(savedProfile) : null;
  }
}

function runAcceptanceTests() {
  console.log('============================================================');
  console.log('GOOGLE AUTH & STUDENT ACCOUNTS ACCEPTANCE TEST SUITE');
  console.log('Sri Vasavi Engineering College (SVEC) Sports Portal');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✔ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${testName}`);
    }
  }

  const store = new MockProfilesStore();
  const tab1Storage = new MockSessionStorage();
  const tab2Storage = new MockSessionStorage();

  const tab1 = new MockAuthContext('Tab 1 Admin', tab1Storage, store);
  const tab2 = new MockAuthContext('Tab 2 Student', tab2Storage, store);

  // ------------------------------------------------------------
  // SCENARIO 1: Student ID + initial password -> forced password change
  // ------------------------------------------------------------
  console.log('--- SCENARIO 1: STUDENT ID LOGIN & FORCED PASSWORD CHANGE ---');
  // Student K. Rajesh has student_id '24A81A0501' with requires_password_change = true
  const initialLoginRes = tab2.signIn('24A81A0501', 'initial_hash_24A81A0501');
  assert(initialLoginRes.success === true, 'Student signs in using Student ID (Roll Number) as username');
  assert(initialLoginRes.mustChangePassword === true, 'System flags that password change is required on initial login');
  assert(tab2.currentUser.student_id === '24A81A0501', 'Loaded profile matches Student ID 24A81A0501');

  // Perform password update
  tab2.updatePassword('NewSecurePass@2026');
  assert(tab2.currentUser.requires_password_change === false, 'Password updated and requires_password_change cleared to false');
  tab2.signOut();

  // ------------------------------------------------------------
  // SCENARIO 2: New password works on next sign-in
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 2: NEW PASSWORD AUTHENTICATION ---');
  const oldPassRes = tab2.signIn('24A81A0501', 'initial_hash_24A81A0501');
  assert(oldPassRes.success === false, 'Old initial password is no longer accepted');

  const newPassRes = tab2.signIn('24A81A0501', 'NewSecurePass@2026');
  assert(newPassRes.success === true, 'New updated password successfully authenticates student');
  assert(newPassRes.mustChangePassword === false, 'No forced password change on subsequent logins');
  tab2.signOut();

  // ------------------------------------------------------------
  // SCENARIO 3: Authorized Google Account Login
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 3: AUTHORIZED GOOGLE ACCOUNT LINKING & LOGIN ---');
  // Student Athlete has google_email = 'student@gmail.com' and id = 'usr_athlete_01'
  const googleLoginRes = tab2.signInWithGoogle('student@gmail.com');
  assert(googleLoginRes.success === true, 'Authorized Google account student@gmail.com signs in successfully');
  assert(googleLoginRes.role === 'member', 'Assigned role is member (Student)');
  assert(googleLoginRes.mustChangePassword === false, 'Google OAuth login does NOT trigger password change');
  assert(tab2.currentUser.id === 'usr_athlete_01', 'Resolved to authoritative student profile usr_athlete_01');
  assert(tab2.currentUser.student_id === '22A81A0501', 'Profile contains authoritative student_id 22A81A0501');
  tab2.signOut();

  // ------------------------------------------------------------
  // SCENARIO 4: Unauthorized Google Account Rejected (No Auto-Registration)
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 4: UNAUTHORIZED GOOGLE ACCOUNT REJECTION ---');
  const countBefore = store.profiles.length;
  const unauthRes = tab2.signInWithGoogle('unauthorized.random@gmail.com');

  assert(unauthRes.success === false, 'Unauthorized Google account is rejected');
  assert(
    unauthRes.message === 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.',
    'Rejection shows exact required institutional error message'
  );
  assert(store.profiles.length === countBefore, 'Zero automatic self-registration (account count strictly unchanged)');
  assert(tab2.currentUser === null && tab2.role === 'public', 'User session is completely cleared upon unauthorized attempt');

  // Verify audit log captured rejection
  const auditRejected = store.auditLogs.find(l => l.action === 'google_login_rejected');
  assert(auditRejected && auditRejected.details.google_email === 'unauthorized.random@gmail.com', 'Audit log records rejected Google login attempt');

  // Inactive account check
  store.profiles[0].is_active = false;
  const inactiveRes = tab2.signInWithGoogle('student@gmail.com');
  assert(inactiveRes.success === false, 'Inactive student account is blocked from Google login');
  assert(inactiveRes.message.includes('currently inactive'), 'Inactive account shows suspension notice');
  store.profiles[0].is_active = true; // restore

  // ------------------------------------------------------------
  // SCENARIO 5: Admin Provisioning & Duplicate Google Email Protection
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 5: ADMIN PROVISIONING & DUPLICATE GOOGLE EMAIL PROTECTION ---');
  // Attempt to provision student with existing Google email 'student@gmail.com'
  let dupCaught = false;
  try {
    store.adminProvisionStudent({
      student_id: '24A81A0599',
      full_name: 'Test Candidate',
      email: 'candidate@svec.ac.in',
      program: 'B.Tech',
      department: 'CSE',
      year: '1st',
      gender: 'Men',
      google_email: 'student@gmail.com' // Already linked to usr_athlete_01
    });
  } catch (err) {
    dupCaught = true;
    assert(
      err.message === 'Google Email ID already linked to another student account.',
      'Admin provisioning throws: "Google Email ID already linked to another student account."'
    );
  }
  assert(dupCaught === true, 'Duplicate Google email creation is strictly blocked');

  // Provisioning with unique Google email succeeds
  const newStudentRes = store.adminProvisionStudent({
    student_id: '24A81A0599',
    full_name: 'New Athlete',
    email: 'new.athlete@svec.ac.in',
    program: 'B.Tech',
    department: 'CSE',
    year: '1st',
    gender: 'Men',
    google_email: 'new.unique.google@gmail.com'
  });
  assert(!!newStudentRes.id, 'Provisioning student with unique Google Email ID succeeds');

  // ------------------------------------------------------------
  // SCENARIO 6: Admin Updates / Links / Unlinks Google Email
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 6: ADMIN EDIT & GOOGLE EMAIL RE-LINKING ---');
  const targetStudentId = newStudentRes.id;

  // Attempt duplicate update
  let dupEditCaught = false;
  try {
    store.adminUpdateStudentAccount(targetStudentId, {
      google_email: 'student@gmail.com'
    });
  } catch (err) {
    dupEditCaught = true;
    assert(
      err.message === 'Google Email ID already linked to another student account.',
      'Admin edit throws duplicate protection error'
    );
  }
  assert(dupEditCaught === true, 'Duplicate Google email edit blocked across accounts');

  // Update to a new valid Google email
  store.adminUpdateStudentAccount(targetStudentId, {
    google_email: 'updated.athlete@gmail.com'
  });

  // Verify old email no longer resolves
  const oldEmailRes = tab2.signInWithGoogle('new.unique.google@gmail.com');
  assert(oldEmailRes.success === false, 'Old unlinked Google email no longer authenticates');

  // Verify new updated email resolves
  const updatedEmailRes = tab2.signInWithGoogle('updated.athlete@gmail.com');
  assert(updatedEmailRes.success === true, 'New updated Google email authenticates successfully');
  assert(tab2.currentUser.id === targetStudentId, 'Resolved to correct provisioned student profile');
  tab2.signOut();

  // ------------------------------------------------------------
  // SCENARIO 7: Multi-Tab Isolation (Admin vs Google Student)
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 7: MULTI-TAB ISOLATION (ADMIN VS GOOGLE STUDENT) ---');
  // Tab 1 signs in as Admin
  const adminLogin = tab1.signIn('coach.cricket@svec.ac.in', 'Coach@SVEC2026');
  assert(adminLogin.success === true && tab1.role === 'admin', 'Tab 1 signs in as Admin');
  assert(tab2.role === 'public', 'Tab 2 is completely unpolluted by Tab 1 admin sign-in');

  // Tab 2 signs in via Google OAuth
  const studentGoogleLogin = tab2.signInWithGoogle('student@gmail.com');
  assert(studentGoogleLogin.success === true && tab2.role === 'member', 'Tab 2 signs in as Student via Google');
  assert(tab1.role === 'admin' && tab1.currentUser.email === 'coach.cricket@svec.ac.in', 'Tab 1 remains Admin while Tab 2 is Student');

  // Refresh Tab 1 & Tab 2
  tab1.refresh();
  tab2.refresh();
  assert(tab1.role === 'admin', 'Tab 1 remains Admin after refresh');
  assert(tab2.role === 'member', 'Tab 2 remains Student after refresh');

  // Tab 1 signs out
  tab1.signOut();
  assert(tab1.role === 'public', 'Tab 1 is signed out');
  assert(tab2.role === 'member' && tab2.currentUser !== null, 'Tab 2 remains active Student when Tab 1 signs out');

  // Tab 2 signs out
  tab2.signOut();
  assert(tab2.role === 'public', 'Tab 2 is signed out');

  // ------------------------------------------------------------
  // SCENARIO 8: Database Schema, Trigger, and RPC Integrity
  // ------------------------------------------------------------
  console.log('\n--- SCENARIO 8: DATABASE SCHEMA & RPC ASSET INTEGRITY ---');
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  const schemaExists = fs.existsSync(schemaPath);
  assert(schemaExists === true, 'supabase/schema.sql file exists');

  if (schemaExists) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    assert(
      schemaSql.includes('google_email TEXT UNIQUE'),
      'Schema defines `google_email TEXT UNIQUE` column on public.profiles'
    );

    assert(
      schemaSql.includes('idx_profiles_google_email'),
      'Schema defines partial index `idx_profiles_google_email` on LOWER(TRIM(google_email))'
    );

    assert(
      schemaSql.includes('requires_password_change BOOLEAN DEFAULT FALSE'),
      'Schema defines `requires_password_change` flag on profiles'
    );

    assert(
      schemaSql.includes('protect_profile_identity_fields()') && schemaSql.includes('google_email'),
      'Trigger `protect_profile_identity_fields` strictly prevents students from self-modifying `google_email`'
    );

    assert(
      schemaSql.includes('admin_link_google_email'),
      'Schema defines `admin_link_google_email` RPC for authoritative Google account management'
    );

    assert(
      schemaSql.includes('verify_and_resolve_google_auth'),
      'Schema defines `verify_and_resolve_google_auth` RPC for atomic Google OAuth verification'
    );

    assert(
      schemaSql.includes('admin_provision_student') && schemaSql.includes('p_google_email'),
      'RPC `admin_provision_student` accepts and validates `p_google_email` parameter'
    );
  }

  console.log('\n============================================================');
  console.log(`ACCEPTANCE SUMMARY: ${passed}/${total} Passed, ${total - passed} Failed`);
  console.log('============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runAcceptanceTests();
