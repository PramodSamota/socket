// test-client.js
import { io } from "socket.io-client";

// ANSI color codes for better console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

class TestClient {
  constructor(username, token) {
    this.username = username;
    this.token = token;
    this.socket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io("http://localhost:3000", {
        auth: { token: this.token },
      });

      this.socket.on("connect", () => {
        console.log(
          `${colors.green}✅ ${this.username} connected${colors.reset}`
        );
        this.setupListeners();
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error(
          `${colors.red}❌ ${this.username} connection error: ${error.message}${colors.reset}`
        );
        reject(error);
      });
    });
  }

  setupListeners() {
    this.socket.on("receive_message", (message) => {
      console.log(
        `${colors.cyan}📩 ${this.username} received message:${colors.reset}`
      );
      console.log(`   From: ${message.sender.username}`);
      console.log(`   Message: "${message.message}"`);
      console.log(
        `   Time: ${new Date(message.timestamp).toLocaleTimeString()}`
      );
    });

    this.socket.on("message_sent", (message) => {
      console.log(
        `${colors.green}✓ ${this.username} message sent successfully${colors.reset}`
      );
    });

    this.socket.on("user_status", (data) => {
      const status = data.online ? "🟢 Online" : "🔴 Offline";
      console.log(
        `${colors.yellow}👤 User ${data.username} is now ${status}${colors.reset}`
      );
    });

    this.socket.on("user_typing", (data) => {
      console.log(
        `${colors.magenta}⌨️  ${data.username} is typing...${colors.reset}`
      );
    });

    this.socket.on("user_stop_typing", (data) => {
      console.log(`${colors.magenta}⌨️  User stopped typing${colors.reset}`);
    });

    this.socket.on("chat_history", (messages) => {
      console.log(
        `${colors.blue}📜 ${this.username} received chat history (${messages.length} messages)${colors.reset}`
      );
      messages.forEach((msg, index) => {
        console.log(
          `   ${index + 1}. [${msg.sender.username}]: ${msg.message}`
        );
      });
    });

    this.socket.on("error", (error) => {
      console.error(
        `${colors.red}❌ ${this.username} error: ${error.message}${colors.reset}`
      );
    });
  }

  sendMessage(receiverId, message) {
    console.log(
      `${colors.blue}📤 ${this.username} sending: "${message}"${colors.reset}`
    );
    this.socket.emit("send_message", { receiverId, message });
  }

  getChatHistory(otherUserId) {
    console.log(
      `${colors.blue}📜 ${this.username} requesting chat history${colors.reset}`
    );
    this.socket.emit("get_chat_history", { otherUserId });
  }

  startTyping(receiverId) {
    this.socket.emit("typing", { receiverId });
  }

  stopTyping(receiverId) {
    this.socket.emit("stop_typing", { receiverId });
  }

  disconnect() {
    this.socket.disconnect();
    console.log(`${colors.red}🔌 ${this.username} disconnected${colors.reset}`);
  }
}

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main test function
async function runTests() {
  console.log(`${colors.cyan}==========================================`);
  console.log(`🧪 Starting Real-Time Chat Tests`);
  console.log(`==========================================${colors.reset}\n`);

  // You need to replace these with actual tokens from login
  const ALICE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTRkNTA0ZGYwM2Q0MDExZmI1MDU2M2UiLCJ1c2VybmFtZSI6ImFsaWNlIiwiaWF0IjoxNzY2Njc3MTEwLCJleHAiOjE3NjY3NjM1MTB9.OnmUNcZ6fjs0pSvmUzcm5h1pYccIW4jcfmtQxW9QgH4";
  const BOB_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTRkNTA1NWYwM2Q0MDExZmI1MDU2NDEiLCJ1c2VybmFtZSI6ImJvYiIsImlhdCI6MTc2NjY3NzExOCwiZXhwIjoxNzY2NzYzNTE4fQ.Q1zzhFoMWdMR9biIsbwLCcw4djhixrBBVXlhBWp_lQU";

  // And these with actual user IDs
  const ALICE_ID = "694d504df03d4011fb50563e";
  const BOB_ID = "694d5055f03d4011fb505641";

  try {
    // Create test clients
    const alice = new TestClient("Alice", ALICE_TOKEN);
    const bob = new TestClient("Bob", BOB_TOKEN);

    // Test 1: Connect both users
    console.log(`\n${colors.yellow}Test 1: Connecting users...${colors.reset}`);
    await alice.connect();
    await wait(1000);
    await bob.connect();
    await wait(2000);

    // Test 2: Alice requests chat history
    console.log(
      `\n${colors.yellow}Test 2: Getting chat history...${colors.reset}`
    );
    alice.getChatHistory(BOB_ID);
    await wait(2000);

    // Test 3: Alice sends message to Bob
    console.log(`\n${colors.yellow}Test 3: Sending messages...${colors.reset}`);
    alice.sendMessage(BOB_ID, "Hello Bob! How are you?");
    await wait(2000);

    // Test 4: Bob replies to Alice
    bob.sendMessage(ALICE_ID, "Hi Alice! I'm doing great, thanks!");
    await wait(2000);

    // Test 5: Typing indicators
    console.log(
      `\n${colors.yellow}Test 4: Testing typing indicators...${colors.reset}`
    );
    alice.startTyping(BOB_ID);
    await wait(1000);
    alice.stopTyping(BOB_ID);
    await wait(1000);

    // Test 6: Multiple messages
    console.log(
      `\n${colors.yellow}Test 5: Sending multiple messages...${colors.reset}`
    );
    alice.sendMessage(BOB_ID, "This is message 1");
    await wait(500);
    alice.sendMessage(BOB_ID, "This is message 2");
    await wait(500);
    bob.sendMessage(ALICE_ID, "Got both messages!");
    await wait(2000);

    // Test 7: Get chat history again
    console.log(
      `\n${colors.yellow}Test 6: Getting updated chat history...${colors.reset}`
    );
    bob.getChatHistory(ALICE_ID);
    await wait(2000);

    // Test 8: Disconnect
    console.log(
      `\n${colors.yellow}Test 7: Disconnecting users...${colors.reset}`
    );
    alice.disconnect();
    await wait(1000);
    bob.disconnect();
    await wait(1000);

    console.log(`\n${colors.green}==========================================`);
    console.log(`✅ All tests completed successfully!`);
    console.log(`==========================================${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(
      `\n${colors.red}❌ Test failed: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// Run tests
runTests();
