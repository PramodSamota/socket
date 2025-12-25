import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username online lastSeen createdAt");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error fetching users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(
      userId,
      "username online lastSeen createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error fetching user" });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ online: true }, "username lastSeen");
    res.json(onlineUsers);
  } catch (error) {
    console.error("Get online users error:", error);
    res.status(500).json({ error: "Server error fetching online users" });
  }
};
