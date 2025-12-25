import User from "../models/User.js";
import {
  getChatHistory,
  saveMessage,
  markAsRead,
} from "../controllers/messageController.js";
import { authenticateSocket } from "../middleware/authMiddleware.js";

const userSockets = new Map();

const socketHandler = (io) => {
  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    console.log(`✅ User connected: ${socket.username} (ID: ${socket.userId})`);

    try {
      userSockets.set(socket.userId, socket.id);

      await User.findByIdAndUpdate(socket.userId, { online: true });

      io.emit("user_status", {
        userId: socket.userId,
        username: socket.username,
        online: true,
      });

      socket.join(socket.userId);

      socket.on("get_chat_history", async (data) => {
        try {
          const { otherUserId } = data;

          if (!otherUserId) {
            return socket.emit("error", {
              message: "Other user ID is required",
            });
          }

          const messages = await getChatHistory(socket.userId, otherUserId);
          socket.emit("chat_history", messages);
        } catch (error) {
          console.error("Get chat history error:", error);
          socket.emit("error", { message: "Failed to fetch chat history" });
        }
      });

      socket.on("send_message", async (data) => {
        try {
          const { receiverId, message } = data;

          if (!receiverId || !message) {
            return socket.emit("error", {
              message: "Receiver ID and message are required",
            });
          }

          if (message.trim().length === 0) {
            return socket.emit("error", { message: "Message cannot be empty" });
          }

          // Save message to database
          const newMessage = await saveMessage(
            socket.userId,
            receiverId,
            message
          );

          // Send to receiver if online
          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", newMessage);
          }

          // Confirm to sender
          socket.emit("message_sent", newMessage);
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Handle typing indicator
      socket.on("typing", (data) => {
        try {
          const { receiverId } = data;

          if (!receiverId) return;

          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("user_typing", {
              userId: socket.userId,
              username: socket.username,
            });
          }
        } catch (error) {
          console.error("Typing indicator error:", error);
        }
      });

      // Handle stop typing
      socket.on("stop_typing", (data) => {
        try {
          const { receiverId } = data;

          if (!receiverId) return;

          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("user_stop_typing", {
              userId: socket.userId,
            });
          }
        } catch (error) {
          console.error("Stop typing error:", error);
        }
      });

      // Handle mark message as read
      socket.on("mark_as_read", async (data) => {
        try {
          const { messageId } = data;

          if (!messageId) {
            return socket.emit("error", { message: "Message ID is required" });
          }

          await markAsRead(messageId);
          socket.emit("message_read", { messageId });
        } catch (error) {
          console.error("Mark as read error:", error);
          socket.emit("error", { message: "Failed to mark message as read" });
        }
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        console.log(`❌ User disconnected: ${socket.username}`);

        try {
          // Remove from active connections
          userSockets.delete(socket.userId);

          // Update user status to offline
          await User.findByIdAndUpdate(socket.userId, {
            online: false,
            lastSeen: new Date(),
          });

          // Broadcast user offline status
          io.emit("user_status", {
            userId: socket.userId,
            username: socket.username,
            online: false,
          });
        } catch (error) {
          console.error("Disconnect error:", error);
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error);
      socket.disconnect();
    }
  });
};

export default socketHandler;
