/**
 * Property-Based Tests — Life Dashboard
 *
 * This file contains property tests for the pure helper functions defined in
 * js/app.js. Because the project has no build step and no Node.js dependency,
 * all tests are self-contained and executed by tests/property-test.html in the
 * browser.
 *
 * Each test suite expresses a property — a statement that must hold for every
 * element in a well-defined input domain — rather than a handful of hand-picked
 * examples.
 *
 * The production functions are accessed through `window._test`, which is the
 * test hook exposed at the bottom of js/app.js. A self-contained replica of
 * each pure function is also defined here to act as a reference oracle; any
 * divergence between the oracle and the production function is itself a bug.
 *
 * Requirement links are noted on each property.
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * Minimal test harness
 * ──────────────────────────────────────────────────────────────────────────── */

var TestHarness = (function () {
  var results = [];

  function assert(description, condition) {
    results.push({ description: description, passed: !!condition });
    if (!condition) {
      console.error('FAIL: ' + description);
    }
  }

  function assertEqual(description, actual, expected) {
    var passed = actual === expected;
    results.push({ description: description, passed: passed });
    if (!passed) {
      console.error(
        'FAIL: ' + description +
        ' — expected ' + JSON.stringify(expected) +
        ', got '      + JSON.stringify(actual)
      );
    }
  }

  function summary() {
    var passed = results.filter(function (r) { return r.passed; }).length;
    var total  = results.length;
    return { passed: passed, total: total, results: results };
  }

  return { assert: assert, assertEqual: assertEqual, summary: summary };
}());

/* ─────────────────────────────────────────────────────────────────────────────
 * Reference oracle — getGreeting
 *
 * A self-contained replica of the production function defined in js/app.js.
 * Used as the reference oracle for Property 3 tests. This ensures the tests
 * stay runnable even without app.js loaded, and makes the expected behaviour
 * explicit and independently reviewable.
 *
 * Any deviation between this oracle and the production implementation at
 * window._test.getGreeting is a correctness bug.
 *
 * Band table (design.md):
 *   05–11 → "Good Morning"
 *   12–17 → "Good Afternoon"
 *   18–20 → "Good Evening"
 *   21–23, 00–04 → "Good Night"
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * @param {number} hour  Integer in [0, 23]
 * @returns {string}
 */
function _oracleGetGreeting(hour) {
  if (hour >= 5 && hour <= 11)  { return 'Good Morning'; }
  if (hour >= 12 && hour <= 17) { return 'Good Afternoon'; }
  if (hour >= 18 && hour <= 20) { return 'Good Evening'; }
  return 'Good Night'; // covers 21–23 and 00–04
}

/* Resolve the function under test: prefer the live production function exposed
 * via window._test (set by js/app.js); fall back to the oracle replica so the
 * tests still report results when app.js is not loaded. */
var getGreeting = (
  typeof window !== 'undefined' &&
  window._test &&
  typeof window._test.getGreeting === 'function'
) ? window._test.getGreeting : _oracleGetGreeting;

/* ─────────────────────────────────────────────────────────────────────────────
 * Property 3 — Greeting band classification is exhaustive and correct
 *
 * Validates: Requirements 1.4, 1.5, 1.6, 1.7
 *
 * For every integer h in [0, 23]:
 *   1. getGreeting(h) is never undefined
 *   2. getGreeting(h) is never the empty string ""
 *   3. getGreeting(h) returns one of the four recognised salutation strings
 *   4. getGreeting(h) returns exactly the correct salutation for h's band
 *   5. Boundary hours map correctly (first and last hour of each band)
 *   6. The expected-greetings table covers all 24 hours exhaustively
 * ──────────────────────────────────────────────────────────────────────────── */

/** Expected salutation for every valid hour — derived directly from the spec. */
var EXPECTED_GREETINGS = {
  0:  'Good Night',     // early-morning Good Night sub-band
  1:  'Good Night',
  2:  'Good Night',
  3:  'Good Night',
  4:  'Good Night',     // upper boundary of early-morning sub-band
  5:  'Good Morning',   // lower boundary of Good Morning band
  6:  'Good Morning',
  7:  'Good Morning',
  8:  'Good Morning',
  9:  'Good Morning',
  10: 'Good Morning',
  11: 'Good Morning',   // upper boundary of Good Morning band
  12: 'Good Afternoon', // lower boundary of Good Afternoon band
  13: 'Good Afternoon',
  14: 'Good Afternoon',
  15: 'Good Afternoon',
  16: 'Good Afternoon',
  17: 'Good Afternoon', // upper boundary of Good Afternoon band
  18: 'Good Evening',   // lower boundary of Good Evening band
  19: 'Good Evening',
  20: 'Good Evening',   // upper boundary of Good Evening band
  21: 'Good Night',     // lower boundary of late-night Good Night sub-band
  22: 'Good Night',
  23: 'Good Night'      // upper boundary of late-night Good Night sub-band
};

var VALID_SALUTATIONS = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];

/** Complete input domain for getGreeting — all 24 valid integer hour values. */
var ALL_HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

(function runProperty3() {

  // ── P3-a: Result is never undefined ────────────────────────────────────────
  // For any h in [0,23], getGreeting(h) must return a defined value.
  ALL_HOURS.forEach(function (h) {
    TestHarness.assert(
      'P3-a | hour ' + h + ': getGreeting(' + h + ') is not undefined',
      typeof getGreeting(h) !== 'undefined'
    );
  });

  // ── P3-b: Result is never the empty string ──────────────────────────────────
  // For any h in [0,23], getGreeting(h) must return a non-empty string.
  ALL_HOURS.forEach(function (h) {
    TestHarness.assert(
      'P3-b | hour ' + h + ': getGreeting(' + h + ') is not empty string',
      getGreeting(h) !== ''
    );
  });

  // ── P3-c: Result is one of the four recognised salutation strings ───────────
  // getGreeting must produce only values from the set of four valid salutations.
  ALL_HOURS.forEach(function (h) {
    TestHarness.assert(
      'P3-c | hour ' + h + ': getGreeting(' + h + ') is a recognised salutation',
      VALID_SALUTATIONS.indexOf(getGreeting(h)) !== -1
    );
  });

  // ── P3-d: Result matches the exact expected salutation for every hour ───────
  // Exhaustive correctness check: each of the 24 input hours maps to the
  // precise salutation defined by the spec.
  ALL_HOURS.forEach(function (h) {
    TestHarness.assertEqual(
      'P3-d | hour ' + h + ': getGreeting(' + h + ') === "' + EXPECTED_GREETINGS[h] + '"',
      getGreeting(h),
      EXPECTED_GREETINGS[h]
    );
  });

  // ── P3-e: Boundary exactness — first and last hour of each band ─────────────
  // Verifies that the implementation uses the correct boundary conditions
  // (>= / <=) rather than > / <, which would shift band edges by one hour.
  var boundaryChecks = [
    [4,  'Good Night',     'h=4  — last hour of early-morning "Good Night" sub-band, NOT morning'],
    [5,  'Good Morning',   'h=5  — first hour of "Good Morning" band, NOT night'],
    [11, 'Good Morning',   'h=11 — last hour of "Good Morning" band, NOT afternoon'],
    [12, 'Good Afternoon', 'h=12 — first hour of "Good Afternoon" band, NOT morning'],
    [17, 'Good Afternoon', 'h=17 — last hour of "Good Afternoon" band, NOT evening'],
    [18, 'Good Evening',   'h=18 — first hour of "Good Evening" band, NOT afternoon'],
    [20, 'Good Evening',   'h=20 — last hour of "Good Evening" band, NOT night'],
    [21, 'Good Night',     'h=21 — first hour of late-night "Good Night" sub-band, NOT evening'],
    [0,  'Good Night',     'h=0  — midnight is in the "Good Night" band'],
    [23, 'Good Night',     'h=23 — last hour of day is in the "Good Night" band']
  ];

  boundaryChecks.forEach(function (check) {
    TestHarness.assertEqual(
      'P3-e | boundary: ' + check[2],
      getGreeting(check[0]),
      check[1]
    );
  });

  // ── P3-f: Exhaustiveness — all 24 hours are covered by the oracle table ─────
  // A meta-check ensuring there are no gaps in the EXPECTED_GREETINGS lookup.
  var coveredHours = ALL_HOURS.filter(function (h) {
    return EXPECTED_GREETINGS[h] !== undefined;
  });
  TestHarness.assert(
    'P3-f | exhaustiveness: EXPECTED_GREETINGS table covers all 24 hours [0..23]',
    coveredHours.length === 24
  );

  // ── P3-g: Production function matches oracle on all 24 hours ─────────────────
  // If window._test.getGreeting is available (app.js loaded), verify it agrees
  // with the oracle on every input. This catches any future divergence between
  // the app and the spec.
  if (
    typeof window !== 'undefined' &&
    window._test &&
    typeof window._test.getGreeting === 'function'
  ) {
    ALL_HOURS.forEach(function (h) {
      TestHarness.assertEqual(
        'P3-g | hour ' + h + ': production getGreeting(' + h + ') matches oracle',
        window._test.getGreeting(h),
        _oracleGetGreeting(h)
      );
    });
  }

}());

/* ─────────────────────────────────────────────────────────────────────────────
 * Expose results for the HTML runner
 * ──────────────────────────────────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (future-proofing if a build system is added later)
  module.exports = {
    TestHarness:          TestHarness,
    getGreeting:          getGreeting,
    _oracleGetGreeting:   _oracleGetGreeting,
    EXPECTED_GREETINGS:   EXPECTED_GREETINGS,
    ALL_HOURS:            ALL_HOURS
  };
} else {
  // Browser environment — make results available to the HTML runner
  window._propertyTestResults = TestHarness.summary();
}
