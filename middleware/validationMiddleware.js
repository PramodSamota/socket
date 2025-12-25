// middleware/validationMiddleware.js

// Validate registration data
export const validateRegister = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      error: "Username must be at least 3 characters long",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long",
    });
  }

  // Check for valid username (alphanumeric and underscore only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error: "Username can only contain letters, numbers, and underscores",
    });
  }

  next();
};

// Validate login data
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  next();
};

// Validate message data
export const validateMessage = (req, res, next) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({
      error: "Receiver ID and message are required",
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: "Message cannot be empty",
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      error: "Message cannot exceed 1000 characters",
    });
  }

  next();
};
