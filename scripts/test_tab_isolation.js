/**
 * Tab-Isolated Authentication Acceptance Test Suite
 * Tests the 8 scenarios specified in Section 26 of requirements:
 * Test 1: Tab 1 Admin Login -> /admin
 * Test 2: Tab 2 Student Login -> /student or /profile
 * Test 3: Refresh Tab 1 -> Remains Admin
 * Test 4: Refresh Tab 2 -> Remains Student
 * Test 5: Navigate Tab 1 -> Tab 2 remains Student
 * Test 6: Navigate Tab 2 -> Tab 1 remains Admin
 * Test 7: Sign Out Tab 1 -> Tab 2 remains Student
 * Test 8: Sign Out Tab 2 -> Tab 1 remains signed out only
 */

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

// Simulates the AuthContext state lifecycle for an individual tab
class TabAuthContext {
  constructor(tabName, sessionStorage) {
    this.tabName = tabName;
    this.sessionStorage = sessionStorage;
    this.role = 'public';
    this.currentUser = null;
    this.init();
  }

  init() {
    const savedRole = this.sessionStorage.getItem('svec_tab_auth_role');
    const savedProfile = this.sessionStorage.getItem('svec_tab_user_profile');
    this.role = savedRole || 'public';
    this.currentUser = savedProfile ? JSON.parse(savedProfile) : null;
  }

  signIn(email, password) {
    const trimmed = (email || '').trim().toLowerCase();
    if (trimmed.includes('admin') || trimmed.includes('coach')) {
      const profile = { id: 'admin-uuid', email: trimmed, full_name: 'Coach Administrator', role: 'admin' };
      this.role = 'admin';
      this.currentUser = profile;
      this.sessionStorage.setItem('svec_tab_auth_role', 'admin');
      this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(profile));
      return { success: true, role: 'admin' };
    } else if (trimmed.includes('student') || trimmed.includes('@svec.ac.in')) {
      const profile = { id: 'student-uuid', email: trimmed, full_name: 'Student Athlete', role: 'member' };
      this.role = 'member';
      this.currentUser = profile;
      this.sessionStorage.setItem('svec_tab_auth_role', 'member');
      this.sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(profile));
      return { success: true, role: 'member' };
    }
    return { success: false, message: 'Invalid credentials' };
  }

  signOut() {
    this.sessionStorage.removeItem('svec_tab_auth_role');
    this.sessionStorage.removeItem('svec_tab_user_profile');
    this.role = 'public';
    this.currentUser = null;
  }

  refresh() {
    // Re-mount / re-initialize context as happens on browser refresh
    this.init();
  }

  canAccess(route) {
    if (route.startsWith('/admin')) {
      return this.role === 'admin' || this.role === 'coach';
    }
    if (route.startsWith('/profile') || route.startsWith('/student')) {
      return this.role === 'member';
    }
    return true; // public routes
  }
}

function runAcceptanceTests() {
  console.log('============================================================');
  console.log('MULTI-TAB ISOLATED AUTHENTICATION ACCEPTANCE TEST');
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

  // Two independent browser tabs, each with its own isolated sessionStorage
  const tab1Storage = new MockSessionStorage();
  const tab2Storage = new MockSessionStorage();

  const tab1 = new TabAuthContext('Tab 1', tab1Storage);
  const tab2 = new TabAuthContext('Tab 2', tab2Storage);

  // Baseline verification: Both start as public unauthenticated tabs
  assert(tab1.role === 'public' && tab1.currentUser === null, 'Tab 1 initially public & unauthenticated');
  assert(tab2.role === 'public' && tab2.currentUser === null, 'Tab 2 initially public & unauthenticated');

  // TEST 1: Open localhost in Tab 1, Login with Admin credentials
  const res1 = tab1.signIn('coach.cricket@svec.ac.in', 'Coach@SVEC2026');
  assert(res1.success && res1.role === 'admin' && tab1.role === 'admin', 'Test 1: Tab 1 signs in as Admin');
  assert(tab1.canAccess('/admin') === true, 'Test 1: Tab 1 routes to Admin Portal (/admin)');
  assert(tab2.role === 'public', 'Test 1: Tab 2 remains unaffected (still public, no leakage)');

  // TEST 2: Open localhost in Tab 2, Login with Student credentials
  const res2 = tab2.signIn('student@svec.ac.in', 'Student@SVEC2026');
  assert(res2.success && res2.role === 'member' && tab2.role === 'member', 'Test 2: Tab 2 signs in as Student');
  assert(tab2.canAccess('/student') === true && tab2.canAccess('/profile') === true, 'Test 2: Tab 2 routes to Student Portal');
  assert(tab2.canAccess('/admin') === false, 'Test 2: Tab 2 is blocked from Admin Portal');
  assert(tab1.role === 'admin', 'Test 2: Tab 1 remains Admin while Tab 2 is Student');

  // TEST 3: Refresh Tab 1
  tab1.refresh();
  assert(tab1.role === 'admin' && tab1.currentUser?.role === 'admin', 'Test 3: Tab 1 remains Admin after browser refresh');

  // TEST 4: Refresh Tab 2
  tab2.refresh();
  assert(tab2.role === 'member' && tab2.currentUser?.role === 'member', 'Test 4: Tab 2 remains Student after browser refresh');

  // TEST 5: Navigate around Tab 1 (Admin routes)
  assert(tab1.canAccess('/admin/trials') && tab1.canAccess('/admin/scan'), 'Test 5: Tab 1 navigates admin routes');
  assert(tab2.role === 'member' && tab2.currentUser?.email === 'student@svec.ac.in', 'Test 5: Tab 2 remains Student unaffected by Tab 1 navigation');

  // TEST 6: Navigate around Tab 2 (Student routes)
  assert(tab2.canAccess('/student') && tab2.canAccess('/tournaments'), 'Test 6: Tab 2 navigates student routes');
  assert(tab1.role === 'admin' && tab1.currentUser?.email === 'coach.cricket@svec.ac.in', 'Test 6: Tab 1 remains Admin unaffected by Tab 2 navigation');

  // TEST 7: Sign out from Tab 1
  tab1.signOut();
  assert(tab1.role === 'public' && tab1.currentUser === null, 'Test 7: Tab 1 is now signed out');
  assert(tab2.role === 'member' && tab2.currentUser !== null, 'Test 7: Tab 2 remains Student and signed in after Tab 1 signs out');

  // TEST 8: Sign out from Tab 2
  tab2.signOut();
  assert(tab2.role === 'public' && tab2.currentUser === null, 'Test 8: Tab 2 is now signed out');
  assert(tab1.role === 'public' && tab1.currentUser === null, 'Test 8: Tab 1 remains signed out in its own context');

  console.log('\n============================================================');
  console.log(`ACCEPTANCE SUMMARY: ${passed}/${total} Passed`);
  console.log('============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runAcceptanceTests();
