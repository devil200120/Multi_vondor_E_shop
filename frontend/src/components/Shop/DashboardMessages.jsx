import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../utils/mediaUtils";
import {
  AiOutlineArrowRight,
  AiOutlineSend,
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlineUser,
} from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BsCircleFill } from "react-icons/bs";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
const ENDPOINT = "https://multi-vondor-e-shop-2.onrender.com";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);

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
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
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
  }, [seller, messages]);

  useEffect(() => {
    if (seller) {
      const userId = seller?._id;
      socketId.emit("addUser", userId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
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
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member.id !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
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
      lastMessageId: seller._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: seller._id,
      })
      .then((res) => {
        console.log(res.data.conversation);
        setNewMessage("");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // img upload

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImages(file);
    imageSendingHandler(file);
  };

  const imageSendingHandler = async (e) => {
    const formData = new FormData();

    formData.append("images", e);
    formData.append("sender", seller._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
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
        lastMessageId: seller._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    // You can add more sophisticated filtering here
    return true; // For now, show all conversations
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!open ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <AiOutlineMessage className="mr-3 h-8 w-8 text-blue-600" />
                  Messages
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Chat with your customers and manage conversations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AiOutlineMessage className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Conversations
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {conversations.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BsCircleFill className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Online Users
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {onlineUsers.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AiOutlineUser className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Active Chats
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {conversations.filter((conv) => onlineCheck(conv)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-gray-200">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((item, index) => (
                <MessageList
                  data={item}
                  key={index}
                  index={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={seller._id}
                  setUserData={setUserData}
                  userData={userData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
                />
              ))
            ) : (
              <div className="p-12 text-center">
                <AiOutlineMessage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No conversations
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start selling products to receive customer messages.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          setMessages={setMessages}
          handleImageUpload={handleImageUpload}
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
  online,
  setActiveStatus,
}) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/dashboard-messages?${id}`);
    setOpen(true);
  };
  const [active, setActive] = useState(0);

  useEffect(() => {
    const userId = data.members.find((user) => user != me);

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/user/user-info/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
        active === index ? "bg-blue-50 border-r-4 border-blue-500" : ""
      }`}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative flex-shrink-0">
        <img
          src={getAvatarUrl(user?.avatar, backend_url)}
          alt={user?.name || "User"}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
        <div
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            online ? "bg-green-400" : "bg-gray-400"
          }`}
        />
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {user?.name || "Unknown User"}
          </h3>
          <span className="text-xs text-gray-500">
            {format(data?.updatedAt)}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <p className="text-sm text-gray-600 truncate flex-1">
            <span className="font-medium">
              {data?.lastMessageId !== user?._id
                ? "You: "
                : `${user?.name?.split(" ")[0] || "User"}: `}
            </span>
            {data?.lastMessage === "Photo" ? (
              <span className="inline-flex items-center">
                <HiOutlinePhotograph className="h-4 w-4 mr-1" />
                Photo
              </span>
            ) : (
              data?.lastMessage
            )}
          </p>
          {online && (
            <div className="ml-2 flex-shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerInbox = ({
  scrollRef,
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  handleImageUpload,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={getAvatarUrl(userData?.avatar, backend_url)}
                alt={userData?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  activeStatus ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {userData?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {activeStatus ? (
                  <span className="inline-flex items-center text-green-600">
                    <BsCircleFill className="h-2 w-2 mr-2" />
                    Active now
                  </span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <AiOutlineArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
            >
              {item.sender !== sellerId && (
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={getAvatarUrl(userData?.avatar, backend_url)}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={userData?.name}
                  />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md ${
                  item.sender === sellerId ? "order-1" : "order-2"
                }`}
              >
                {item.images && (
                  <div className="mb-2">
                    <img
                      src={`${backend_url}${item.images}`}
                      className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                      alt="Shared image"
                    />
                  </div>
                )}

                {item.text && item.text.trim() !== "" && (
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      item.sender === sellerId
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{item.text}</p>
                  </div>
                )}

                <p
                  className={`text-xs text-gray-500 mt-1 ${
                    item.sender === sellerId ? "text-right" : "text-left"
                  }`}
                >
                  {format(item.createdAt)}
                </p>
              </div>

              {item.sender === sellerId && (
                <div className="flex-shrink-0 ml-3 order-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userData?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AiOutlineMessage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No messages yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start the conversation!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <form
          onSubmit={sendMessageHandler}
          className="flex items-center space-x-3"
        >
          <div className="flex-shrink-0">
            <input
              type="file"
              name="image"
              id="image"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
            <label
              htmlFor="image"
              className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <TfiGallery className="h-5 w-5" />
            </label>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              required
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <AiOutlineSend className="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardMessages;
