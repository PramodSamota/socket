import Message from "../models/Message.js";

export const getChatHistory = async (userId, otherUserId) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender receiver", "username");

    return messages;
  } catch (error) {
    console.error("Get chat history error:", error);
    throw error;
  }
};

// Save new message
export const saveMessage = async (senderId, receiverId, messageText) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message: messageText,
    });

    await newMessage.save();
    await newMessage.populate("sender receiver", "username");

    return newMessage;
  } catch (error) {
    console.error("Save message error:", error);
    throw error;
  }
};

export const markAsRead = async (messageId) => {
  try {
    await Message.findByIdAndUpdate(messageId, { read: true });
  } catch (error) {
    console.error("Mark as read error:", error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    await Message.findByIdAndDelete(messageId);
    return true;
  } catch (error) {
    console.error("Delete message error:", error);
    throw error;
  }
};
