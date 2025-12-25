// test-api.js
// Run with: node test-api.js

const API_URL = "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper function to make API calls
async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, data };
}

// Test function
async function test(name, testFn) {
  try {
    console.log(`\n${colors.blue}▶ Running: ${name}${colors.reset}`);
    await testFn();
    console.log(`${colors.green}✓ PASSED: ${name}${colors.reset}`);
    testResults.passed++;
    testResults.tests.push({ name, status: "PASSED" });
  } catch (error) {
    console.error(`${colors.red}✗ FAILED: ${name}${colors.reset}`);
    console.error(`  Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: "FAILED", error: error.message });
  }
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Main test suite
async function runAPITests() {
  console.log(`${colors.cyan}==========================================`);
  console.log(`🧪 Testing REST API Endpoints`);
  console.log(`==========================================${colors.reset}\n`);

  let aliceToken, bobToken;
  let aliceId, bobId;

  // Test 1: Health Check
  await test("Health Check Endpoint", async () => {
    const { status, data } = await apiCall("/health");
    assert(status === 200, "Expected status 200");
    assert(data.status === "ok", "Expected status to be ok");
    console.log(`  Response: ${JSON.stringify(data)}`);
  });

  // Test 2: Register Alice
  await test("Register User - Alice", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "alice_test1",
      password: "password123",
    });

    assert(status === 201, `Expected status 201, got ${status}`);
    assert(data.userId, "Expected userId in response");
    assert(data.username === "alice_test", "Username mismatch");

    aliceId = data.userId;
    console.log(`  User ID: ${aliceId}`);
  });

  // Test 3: Register Bob
  await test("Register User - Bob", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "bob_test1",
      password: "password123",
    });

    assert(status === 201, `Expected status 201, got ${status}`);
    assert(data.userId, "Expected userId in response");

    bobId = data.userId;
    console.log(`  User ID: ${bobId}`);
  });

  // Test 4: Duplicate Registration (Should Fail)
  await test("Register Duplicate User - Should Fail", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "alice_test",
      password: "password123",
    });

    assert(status === 400, `Expected status 400, got ${status}`);
    assert(data.error, "Expected error message");
    console.log(`  Error: ${data.error}`);
  });

  // Test 5: Login Alice
  await test("Login - Alice", async () => {
    const { status, data } = await apiCall("/api/auth/login", "POST", {
      username: "alice_test1",
      password: "password123",
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.token, "Expected token in response");
    assert(data.userId === aliceId, "User ID mismatch");

    aliceToken = data.token;
    console.log(`  Token: ${data.token.substring(0, 20)}...`);
  });

  // Test 6: Login Bob
  await test("Login - Bob", async () => {
    const { status, data } = await apiCall("/api/auth/login", "POST", {
      username: "bob_test1",
      password: "password123",
    });

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.token, "Expected token in response");

    bobToken = data.token;
    console.log(`  Token: ${data.token.substring(0, 20)}...`);
  });

  // Test 7: Invalid Login
  await test("Login with Wrong Password - Should Fail", async () => {
    const { status, data } = await apiCall("/api/auth/login", "POST", {
      username: "alice_test",
      password: "wrongpassword",
    });

    assert(status === 401, `Expected status 401, got ${status}`);
    assert(data.error, "Expected error message");
    console.log(`  Error: ${data.error}`);
  });

  // Test 8: Get All Users
  await test("Get All Users", async () => {
    const { status, data } = await apiCall("/api/users");

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(Array.isArray(data), "Expected array of users");
    assert(data.length >= 2, "Expected at least 2 users");
    console.log(`  Found ${data.length} users`);
  });

  // Test 9: Get User by ID
  await test("Get User by ID - Alice", async () => {
    const { status, data } = await apiCall(`/api/users/${aliceId}`, "GET");

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(data.username === "alice_test", "Username mismatch");
    assert(data._id === aliceId, "User ID mismatch");
    console.log(`  User: ${data.username}`);
  });

  // Test 10: Get Online Users
  await test("Get Online Users", async () => {
    const { status, data } = await apiCall("/api/users/online");

    assert(status === 200, `Expected status 200, got ${status}`);
    assert(Array.isArray(data), "Expected array of users");
    console.log(`  Online users: ${data.length}`);
  });

  // Test 11: Validation - Short Username
  await test("Register with Short Username - Should Fail", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "ab",
      password: "password123",
    });

    assert(status === 400, `Expected status 400, got ${status}`);
    assert(data.error, "Expected error message");
    console.log(`  Error: ${data.error}`);
  });

  // Test 12: Validation - Short Password
  await test("Register with Short Password - Should Fail", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "testuser",
      password: "12345",
    });

    assert(status === 400, `Expected status 400, got ${status}`);
    assert(data.error, "Expected error message");
    console.log(`  Error: ${data.error}`);
  });

  // Test 13: Validation - Invalid Username Characters
  await test("Register with Invalid Username - Should Fail", async () => {
    const { status, data } = await apiCall("/api/auth/register", "POST", {
      username: "user@name!",
      password: "password123",
    });

    assert(status === 400, `Expected status 400, got ${status}`);
    assert(data.error, "Expected error message");
    console.log(`  Error: ${data.error}`);
  });

  // Print Summary
  console.log(`\n${colors.cyan}==========================================`);
  console.log(`📊 Test Results Summary`);
  console.log(`==========================================${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.tests
      .filter((t) => t.status === "FAILED")
      .forEach((t) => console.log(`  - ${t.name}: ${t.error}`));
  }

  console.log(
    `\n${colors.yellow}💡 For Socket.IO tests, use the tokens below:${colors.reset}`
  );
  console.log(`${colors.cyan}Alice Token:${colors.reset} ${aliceToken}`);
  console.log(`${colors.cyan}Bob Token:${colors.reset} ${bobToken}`);
  console.log(`${colors.cyan}Alice ID:${colors.reset} ${aliceId}`);
  console.log(`${colors.cyan}Bob ID:${colors.reset} ${bobId}`);

  console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
  console.log(`1. Copy the tokens and user IDs above`);
  console.log(`2. Update test-client.js with these values`);
  console.log(`3. Run: node test-client.js`);

  console.log(
    `\n${colors.cyan}==========================================${colors.reset}\n`
  );
}

// Run the tests
runAPITests().catch(console.error);
