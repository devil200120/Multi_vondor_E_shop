import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { backend_url, server } from "../server";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineArrowRight,
  AiOutlineSend,
  AiOutlineSearch,
  AiOutlinePhone,
  AiOutlineVideoCamera,
  AiOutlineMore,
  AiOutlineArrowLeft,
  AiOutlineCheck,
  AiOutlineDelete,
  AiOutlineEllipsis,
  AiOutlinePaperClip,
} from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { BsEmojiSmile, BsMic, BsThreeDots } from "react-icons/bs";
import { RiAttachment2 } from "react-icons/ri";
import { MdOutlineMarkUnreadChatAlt, MdMarkChatRead } from "react-icons/md";
import styles from "../styles/styles";
const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const scrollRef = useRef(null);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    // This would need userData from each conversation
    return true; // Placeholder for now
  });

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedConversations([]);
  };

  const handleConversationSelect = (conversationId) => {
    if (isSelectionMode) {
      setSelectedConversations((prev) =>
        prev.includes(conversationId)
          ? prev.filter((id) => id !== conversationId)
          : [...prev, conversationId]
      );
    }
  };

  const deleteSelectedConversations = async () => {
    try {
      // Implementation for deleting conversations
      console.log("Deleting conversations:", selectedConversations);
      setSelectedConversations([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting conversations:", error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      // Implementation for marking as read
      console.log("Marking as read:", conversationId);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const resonse = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          {
            withCredentials: true,
          }
        );

        setConversations(resonse.data.conversations);
      } catch (error) {
        // console.log(error);
      }
    };
    getConversation();
  }, [user, messages]);

  useEffect(() => {
    if (user) {
      const userId = user?._id;
      socketId.emit("addUser", userId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);

    return online ? true : false;
  };

  // get messages
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [currentChat]);

  // create new message
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    socketId.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        await axios
          .post(`${server}/message/create-new-message`, message)
          .then((res) => {
            setMessages([...messages, res.data.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      })
      .then((res) => {
        setNewMessage("");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImages(file);
    imageSendingHandler(file);
  };

  const imageSendingHandler = async (e) => {
    const formData = new FormData();

    formData.append("images", e);
    formData.append("sender", user._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socketId.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      images: e,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImages();
          setMessages([...messages, res.data.message]);
          updateLastMessageForImage();
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessageForImage = async () => {
    await axios.put(
      `${server}/conversation/update-last-message/${currentChat._id}`,
      {
        lastMessage: "Photo",
        lastMessageId: user._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {!open ? (
        // Inbox List View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Inbox Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <p className="text-blue-100 text-sm">
                      {conversations.length} conversations
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSelectionMode && (
                      <>
                        <button
                          onClick={deleteSelectedConversations}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          disabled={selectedConversations.length === 0}
                        >
                          <AiOutlineDelete size={20} />
                        </button>
                        <button
                          onClick={toggleSelectionMode}
                          className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {!isSelectionMode && (
                      <button
                        onClick={toggleSelectionMode}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <BsThreeDots size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <AiOutlineSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <div className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MdOutlineMarkUnreadChatAlt
                      size={32}
                      className="text-gray-400"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500">
                    Start shopping to connect with sellers and begin
                    conversations!
                  </p>
                </div>
              ) : (
                conversations.map((item, index) => (
                  <MessageList
                    key={item._id}
                    data={item}
                    index={index}
                    setOpen={setOpen}
                    setCurrentChat={setCurrentChat}
                    me={user?._id}
                    setUserData={setUserData}
                    userData={userData}
                    online={onlineCheck(item)}
                    setActiveStatus={setActiveStatus}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedConversations.includes(item._id)}
                    onSelect={() => handleConversationSelect(item._id)}
                    onMarkAsRead={() => markAsRead(item._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // Chat View
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={user._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          showMessageOptions={showMessageOptions}
          setShowMessageOptions={setShowMessageOptions}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
  isSelectionMode,
  isSelected,
  onSelect,
  onMarkAsRead,
}) => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (isSelectionMode) {
      onSelect();
    } else {
      navigate(`/inbox?${id}`);
      setOpen(true);
    }
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/shop/get-shop-info/${userId}`);
        setUser(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  const formatTime = (date) => {
    const messageDate = new Date(data.updatedAt);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div
      className={`relative group hover:bg-gray-50 transition-colors duration-200 ${
        active === index ? "bg-blue-50 border-r-4 border-blue-500" : ""
      } ${isSelected ? "bg-blue-100" : ""}`}
    >
      <div
        className="flex items-center p-4 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          setActive(index);
          handleClick(data._id);
          setCurrentChat(data);
          setUserData(user);
          setActiveStatus(online);
        }}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        )}

        {/* Avatar with Online Status */}
        <div className="relative flex-shrink-0">
          <img
            src={
              user?.avatar
                ? `${backend_url}${user.avatar}`
                : "/api/placeholder/50/50"
            }
            alt={user?.name || "User"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              online ? "bg-green-400" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Message Content */}
        <div className="flex-1 ml-3 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "Unknown User"}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{formatTime()}</span>
              {/* Unread indicator */}
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 truncate max-w-xs">
              <span className="font-medium">
                {data?.lastMessageId !== user?._id ? "You: " : ""}
              </span>
              {data?.lastMessage || "No messages yet"}
            </p>

            {/* Message status indicators */}
            <div className="flex items-center space-x-1">
              {data?.lastMessageId === me && (
                <AiOutlineCheck className="text-blue-500" size={14} />
              )}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        {!isSelectionMode && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <BsThreeDots size={16} className="text-gray-400" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                    setShowOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <MdMarkChatRead size={16} />
                  <span>Mark as read</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add delete functionality
                    setShowOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <AiOutlineDelete size={16} />
                  <span>Delete conversation</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
  showEmojiPicker,
  setShowEmojiPicker,
  showMessageOptions,
  setShowMessageOptions,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler(e);
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🙏",
    "😢",
    "😮",
    "😡",
    "🔥",
    "💯",
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <AiOutlineArrowLeft size={20} className="text-gray-600" />
            </button>

            <div className="relative">
              <img
                src={
                  userData?.avatar
                    ? `${backend_url}${userData.avatar}`
                    : "/api/placeholder/40/40"
                }
                alt={userData?.name || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  activeStatus ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                {userData?.name || "Unknown User"}
              </h2>
              <p className="text-sm text-gray-500">
                {activeStatus ? "Active now" : "Last seen recently"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <AiOutlinePhone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <AiOutlineVideoCamera size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <AiOutlineMore size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MdOutlineMarkUnreadChatAlt size={24} />
            </div>
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">
              Send a message to begin chatting with {userData?.name}
            </p>
          </div>
        ) : (
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  item.sender === sellerId ? "order-2" : "order-1"
                }`}
              >
                {item.sender !== sellerId && (
                  <img
                    src={
                      userData?.avatar
                        ? `${backend_url}${userData.avatar}`
                        : "/api/placeholder/32/32"
                    }
                    className="w-8 h-8 rounded-full mb-1"
                    alt=""
                  />
                )}

                {/* Image Message */}
                {item.images && (
                  <div className="relative group">
                    <img
                      src={`${backend_url}${item.images}`}
                      className="max-w-xs rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      alt="Shared image"
                      onClick={() => {
                        // Add image viewer functionality
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowMessageOptions(index)}
                        className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <BsThreeDots size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {item.text && (
                  <div className="relative group">
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        item.sender === sellerId
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{item.text}</p>
                    </div>

                    {/* Message Options */}
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowMessageOptions(index)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <BsThreeDots size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`flex items-center mt-1 ${
                    item.sender === sellerId ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(item.createdAt)}
                  </span>
                  {item.sender === sellerId && (
                    <AiOutlineCheck size={12} className="ml-1 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-200 rounded-full px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">typing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-xl hover:bg-gray-200 rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attachment Menu */}
        {showAttachments && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-3 gap-3">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center p-3 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                <TfiGallery size={24} className="text-blue-500 mb-1" />
                <span className="text-xs text-gray-600">Photos</span>
              </label>
              <button className="flex flex-col items-center p-3 hover:bg-gray-200 rounded-lg transition-colors">
                <AiOutlinePaperClip size={24} className="text-green-500 mb-1" />
                <span className="text-xs text-gray-600">Files</span>
              </button>
              <button className="flex flex-col items-center p-3 hover:bg-gray-200 rounded-lg transition-colors">
                <BsMic size={24} className="text-red-500 mb-1" />
                <span className="text-xs text-gray-600">Voice</span>
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={sendMessageHandler}
          className="flex items-end space-x-3"
        >
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-2 rounded-full transition-colors ${
              showAttachments
                ? "bg-blue-500 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <RiAttachment2 size={20} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all placeholder-gray-500"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                showEmojiPicker
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BsEmojiSmile size={18} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <AiOutlineSend size={18} />
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </form>
      </div>
    </div>
  );
};

export default UserInbox;
