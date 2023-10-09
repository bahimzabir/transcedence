import noChat from "../assets/no-chat.svg";
import { BsFillTrash3Fill, BsSendFill } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import React, { useEffect, useRef, useState } from "react";
import { MessageContainer, AddChannel, Member, AddFriend } from "./index";
import { Socket, io } from "socket.io-client";
import axios from "axios";
import "../styles/AddChannel.css";
import "../styles/Chat.css";
import {
  MemberProps,
  classSystemEnum,
  infonotify,
  intermessages,
  intersetchannel,
  messagedto,
  notifyoferror,
} from "./chatInterfaces";

const Chat = () => {
  const [challengebutton, setChallengebutton] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channels, setChannels] = useState<intersetchannel[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<intermessages[]>([]);
  const [member, setMember] = useState<MemberProps[]>([]);
  const [selectedChannel, setSelectedChannel] =
  useState<intersetchannel | null>(null);
  const selectedChannelRef = useRef(selectedChannel);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const [showinvite, setShowinvite] = useState(false);
  const handleArrowClick = async () => {
    if (inputValue.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: inputValue.trim(),
          isSentByMe: true,
          img: "",
          date: "",
        },
      ]);
      setInputValue("");
      const now = new Date();
      const dto = {
        id: selectedChannel?.id,
        message: inputValue.trim(),
        sender: await whoami(),
        roomid: selectedChannel?.id,
        data: `${now.getHours()}:${now.getMinutes()}`,
      };
      socket?.emit("createMessage", dto, {
        withCredentials: true,
      });
      const index = channels.findIndex((channel) => channel.id === dto.roomid);
      if (index >= 1) {
        const channel = channels[index];
        channels.splice(index, 1);
        setChannels([channel, ...channels]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleArrowClick();
    }
  };

  const addChannel = async (currentChannel: intersetchannel) => {
    try {
      const formData = new FormData();
      formData.append("file", currentChannel.img);
      formData.append("name", currentChannel.name);
      formData.append("status", currentChannel.status);
      await axios.post("/api/chat/new", formData, {
        withCredentials: true,
      });
    } catch (error) {}
    await Getmyrooms();
  };
  const [popup, setPopup] = useState(false);
  const [addFriendPopup, setAddFriendPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popup);
  };
  const toggleAddFriendPopup = () => {
    setAddFriendPopup(!addFriendPopup);
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  async function getRoomChannels() {
    try {
      const response = await axios.get(
        "/api/users/me/chatrooms",
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  async function getChannelmsg(id: any) {
    try {
      const res = await axios.get(
        "/api/chat/getroomsmsg?id=" + id,
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      alert("error in getting channels rooms");
    }
  }
  async function getdminfos(id: number) {
    let room: intersetchannel = {
      name: "",
      img: "",
      id: 0,
      status: "dm",
      notification: false,
    };
    try {
      const res = await axios.get(
        "/api/chat/getdminfos?id=" + id,
        {
          withCredentials: true,
        }
      );
      room = {
        name: res.data.name,
        img: res.data.photo,
        id: res.data.id,
        status: "dm",
        notification: res.data.roomUsers[0].unreadMessage,
      };
    } catch {
      alert("error in getting dm infos");
    }
    return room;
  }
  const Getmyrooms = async () => {
    let newchannel: intersetchannel[] = [];
    const rooms = await getRoomChannels();
    for (const element of rooms) {
      if (element.isdm !== true) {
        const room: intersetchannel = {
          name: element.name,
          img: element.photo,
          id: element.id,
          status: element.state,
          notification: element.roomUsers[0].unreadMessage,
        };
        newchannel = [...newchannel, room];
      } else {
        const dm: intersetchannel = await getdminfos(element.id);
        newchannel = [...newchannel, dm];
      }
    }
    setChannels(newchannel);
  };
  useEffect(() => {
    // Scroll to the bottom when a new message is added
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //-------------------------------------------casper-------------------------------------//
  async function getandSetmsgchannel() {
    if (selectedChannel !== null) {
      const id: number = await whoami();
      let msg: {
        message: string;
        isSentByMe: boolean;
        img: string;
        date: string;
      }[] = [];
      const msgs = await getChannelmsg(selectedChannel?.id);
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].senderId == id) {
          msg = [
            ...msg,
            {
              message: msgs[i].content,
              isSentByMe: true,
              img: "",
              date: msgs[i].createdAt,
            },
          ];
        } else {
          msg = [
            ...msg,
            {
              message: msgs[i].content,
              isSentByMe: false,
              img: "/api/" + msgs[i].senderId + ".png",
              date: msgs[i].createdAt,
            },
          ];
        }
      }
      setMessages(msg);
    }
  }
  useEffect(() => {
    Getmyrooms();
  }, [])
  useEffect(() => {
    setMembers();
    getandSetmsgchannel();
    if (selectedChannel?.status === "dm") setChallengebutton(true);
    else setChallengebutton(false);
    if (selectedChannel?.notification === true) {
      socket?.emit("messageSeen", selectedChannel?.id, {
        withCredentials: true,
      });
      const index = channels.indexOf(selectedChannel);
      channels[index].notification = false;
    }
  }, [selectedChannel]);

  const socketRef = useRef<Socket | null>(null);
  async function whoami() {
    try {
      const me = await axios.get("/api/users/me", {
        withCredentials: true,
      });
      return me.data.id;
    } catch (error) {
      notifyoferror("error in getting user");
    }
  }
  async function receivemsg(dto: messagedto) {
    if (!selectedChannelRef.current || selectedChannelRef.current.id !== dto.roomid) {
      const index = channels.findIndex((channel) => channel.id === dto.roomid);
      if (index != -1){
        channels[index].notification =  true;
        setChannels([...channels]); 
      }
      socket?.emit("messagedontseen", {id: await whoami() , roomid: dto.roomid}, {
        withCredentials: true}
        )
    }
    if (selectedChannelRef.current) {
      if (selectedChannelRef.current?.id === dto.roomid) {
        const now = new Date();
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: dto.message,
            isSentByMe: false,
            img: "/api/images/" + dto.sender + ".png",
            date: `${now.getHours()}:${now.getMinutes()}`,
          },
        ]);
      }
    }
  }
  useEffect(() => {
    socket?.on("newmessage", receivemsg);
    return () =>
    {
      socket?.off("newmessage", receivemsg)
    }
  }, [socket, channels]);
  useEffect(() => {
    if (socketRef.current === null) {
      socketRef.current = io("/api", {
        withCredentials: true,
      });
      setSocket(socketRef.current);
    }
    socket?.on("error", (val: string) => {
      notifyoferror(val);
    });
    socket?.on("info", (val: string) => {
      infonotify(val);
    });
    socket?.on("leavebyexit", async () => {
      await Getmyrooms();
      setSelectedChannel(null);
    });
    socket?.on("leave", () => {
      Getmyrooms();
    });
    return ()=> {
      socket?.disconnect();
    }
  }, [socket]);
  async function getmemeberoom(roomID: number) {
    const res = await axios.get(
      "/api/chat/roomMemebers?id=" + roomID,
      {
        withCredentials: true,
      }
    );
    return res.data;
  }
  const setMembers = async () => {
    if (selectedChannel != null) {
      let getmember: any;
      getmember = await getmemeberoom(selectedChannel?.id);
      let members: MemberProps[] = [];
      const me: number = await whoami();
      let mystatus: classSystemEnum = classSystemEnum.NORMAL;
      const myroomuser = getmember.roomUsers.find((element: any) => {
        if (element.userId == me) {
          mystatus = element.status;
          return true;
        }
      });
      getmember.members.forEach((element: { username: string; id: number }) => {
        const newmember: MemberProps = {
          id: element.id,
          username: element.username,
          img: "/api/images/" + element.id + ".png",
          isAdmin: me != element.id ? true : false,
          roomid: selectedChannel.id,
        };
        const userclassSystem = getmember.roomUsers.find(
          (roomuser: { userId: number; status: string }) => {
            if (roomuser.userId == element.id) return true;
          }
        );
        if (
          me !== element.id &&
          classSystemEnum[userclassSystem.status] > classSystemEnum[mystatus]
        )
          newmember.isAdmin = false;
        members = [...members, newmember];
      });
      if (myroomuser.status === "OWNER" || myroomuser.status === "ADMIN")
        setShowinvite(true);
      setMember(members);
    }
  };
  const leaveroom = async () => {
    if (selectedChannel?.id) {
      socket?.emit("leaveroom", selectedChannel?.id, {
        withCredentials: true,
      });
    }
  };
  const deletechat = async () => {
    if (selectedChannel?.id) {
      socket?.emit("rmchat", selectedChannel?.id, {
        withCredentials: true,
      });
    }
  };
  return (
    <div className="parent flex flex-row justify-center items-center gap-[1vw] h-screen max-sm:flex-col max-md:flex-col">
      <div className="child-container-1">
        <div className="container-1 font-satoshi text-white w-[18vw] h-[90vh] max-sm:w-[80vw] max-sm:h-[45vh] max-md:w-[80vw] max-md:h-[45vh] flex flex-col justify-center items-center relative">
          <h3 className="absolute top-[3vh] max-sm:top-[1.8vh] max-md:top-[1.8vh] uppercase font-bold text-[1vw] max-sm:text-[2vw] max-md:text-[1.4vw]">
            Conversations
          </h3>
          <span className="line absolute top-[8vh] max-sm:top-[5vh] max-md:top-[5vh]"></span>
          <span className="line absolute bottom-[9vh] max-sm:bottom-[5vh] max-md:bottom-[5vh]"></span>
          <a onClick={togglePopup}>
            <span className="plus-icon w-[3vw] h-[3vw] max-sm:w-[5vw] max-sm:h-[5vw] max-md:w-[4vw] max-md:h-[4vw] rounded-full absolute bottom-[2vh] right-[1.5vw] max-sm:bottom-[1vh] max-sm:right-[3vw] max-md:bottom-[1vh] max-md:right-[2vw] flex justify-center items-center cursor-pointer">
              <FiPlus className="text-[1.2vw] max-sm:text-[2vw] max-md:text-[2vw]" />
            </span>
          </a>
          <div className="red-divs h-[72.5vh] max-sm:h-[35vh] max-md:h-[35vh] mb-[1vh] max-sm:mt-[1vh] max-md:mt-[1vh] w-full overflow-y-scroll no-scrollbar overflow-hidden">
            {channels.map((channel, idx) => (
              <div
                key={idx}
                className={`channel flex relative top-0 items-center px-[1vw] max-sm:px-[3vw] max-md:px-[3vw] scroll-auto h-[8vh] max-sm:h-[5vh] max-md:h-[5vh] hover:cursor-pointer ${
                  selectedChannel === channel ? "active-channel" : ""
                }`}
                onClick={() => {
                  setSelectedChannel(channel);
                  selectedChannelRef.current = channel;
                }}
              >
                <img
                  className="w-[2.5vw] h-[2.5vw] max-sm:w-[6vw] max-sm:h-[6vw] max-md:w-[4vw] max-md:h-[4vw] rounded-full object-cover"
                  src={
                    typeof channel.img === "string"
                      ? channel.img
                      : URL.createObjectURL(channel.img)
                  }
                  alt="Apollo"
                />
                <h4 className="font-medium ml-[.6vw] text-[1vw] max-sm:ml-[2vw] max-sm:text-[2vw] max-md:ml-[1.5vw] max-md:text-[1.4vw]">
                  {channel.name}
                </h4>
                {channel.notification && (
                  <span className="bg-red-300 w-[.8vw] h-[.8vw] absolute right-[1vw] rounded-full"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedChannel ? (
        <div className="child-container-2">
          <div className="container-2 font-satoshi text-white w-[65vw] h-[90vh] max-sm:w-[80vw] max-sm:h-[45vh] max-md:w-[80vw] max-md:h-[45vh] flex flex-col justify-center items-start relative overflow-hidden">
            <img
              className="w-[2.5vw] h-[2.5vw] max-sm:w-[6vw] max-sm:h-[6vw] max-md:w-[4vw] max-md:h-[4vw] rounded-full absolute top-[2vh] max-sm:top-[1vh] max-md:top-[1vh] left-[2vw] max-sm:left-[3vw] max-md:left-[3vw] object-cover"
              src={
                typeof selectedChannel?.img === "string"
                  ? selectedChannel?.img
                  : URL.createObjectURL(selectedChannel?.img)
              }
              alt="Apollo"
            />
            <h3 className="absolute top-[3vh] max-sm:top-[1.8vh] max-md:top-[1.8vh] font-bold left-[5.5vw] max-sm:left-[11vw] max-md:left-[8vw] text-[1vw] max-sm:text-[2vw] max-md:text-[1.4vw]">
              {selectedChannel.name}
            </h3>
            {!challengebutton ? (
              <>
                <button
                  className="container-1 absolute top-[2.2vh] right-[2vw] px-[1.5vw] py-[.4vw] mr-[3vw] uppercase font-bold hover:scale-105 text-[.7vw]"
                  onClick={leaveroom}
                >
                  leave channel
                </button>
                <div className="menu--right" role="navigation">
                  <div className="menuToggle relative h-[90vh]">
                    <input type="checkbox" />
                    <p className="members-text font-satoshi font-medium uppercase text-[1vw]">
                      members
                    </p>
                    <span></span>
                    <span></span>
                    <span></span>
                    <ul className="menuItem member-menu absolute w-[30vw] h-[91vh] pt-[3vw] pr-[9vw] pl-[1vw]">
                      <li className="overflow-y-scroll no-scrollbar mt-[3.3vh] pb-[2.5vh] h-[72.4vh]">
                        {member.map((user: MemberProps, idx) => (
                          <Member
                            username={user.username}
                            img={user.img}
                            isAdmin={user.isAdmin}
                            id={user.id}
                            socket={socket}
                            roomid={user.roomid}
                            key={idx}
                          />
                        ))}
                      </li>

                      <div className="line absolute bottom[9.5vh]"></div>
                      {showinvite && (
                        <a onClick={toggleAddFriendPopup}>
                          <div className="plus-icon w-[3vw] h-[3vw] max-sm:w-[5vw] max-sm:h-[5vw] max-md:w-[4vw] max-md:h-[4vw] rounded-full absolute bottom-[2vh] right-[10vw] max-sm:bottom-[1vh] max-sm:right-[3vw] max-md:bottom-[1vh] max-md:right-[2vw] flex justify-center items-center cursor-pointer">
                            <FiPlus className="text-[1.2vw] max-sm:text-[2vw] max-md:text-[2vw]" />
                          </div>
                        </a>
                      )}
                      <div className="plus-icon w-[3vw] h-[3vw] max-sm:w-[5vw] max-sm:h-[5vw] max-md:w-[4vw] max-md:h-[4vw] rounded-full absolute bottom-[2vh] left-[2vw] max-sm:bottom-[1vh] max-sm:right-[3vw] max-md:bottom-[1vh] max-md:right-[2vw] flex justify-center items-center cursor-pointer">
                        <BsFillTrash3Fill
                          className="text-[1.2vw] max-sm:text-[2vw] max-md:text-[2vw]"
                          onClick={deletechat}
                        />
                      </div>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <button className="container-1 absolute top-[2.2vh] right-[2vw] px-[1.5vw] py-[.4vw] uppercase font-bold hover:scale-105 text-[.7vw]">
                challenge
              </button>
            )}
            {addFriendPopup && (
              <AddFriend
                toggleAddFriendPopup={toggleAddFriendPopup}
                socket={socket}
                roomid={selectedChannel.id}
              />
            )}
            <span className="line absolute top-[8vh] max-sm:top-[5vh] max-md:top-[5vh]"></span>
            <span className="line absolute bottom-[9vh] max-sm:bottom-[5vh] max-md:bottom-[5vh]"></span>
            <div className="h-[72.5vh] max-sm:h-[35vh] max-md:h-[35vh] w-full mb-[1vh] max-sm:mb-0 max-md:mb-0 px-[1.5vw] overflow-y-scroll no-scrollbar overflow-hidden">
              <div
                className="max-h-[72.5vh] max-sm:max-h-[35vh] max-md:max-h-[35vh] overflow-y-scroll no-scrollbar overflow-hidden"
                ref={messagesContainerRef}
              >
                {messages.map((message, idx) => (
                  <MessageContainer
                    key={idx}
                    message={message.message}
                    isSentByMe={message.isSentByMe}
                    img={message.img}
                    date={message.date}
                  />
                ))}
              </div>
            </div>
            <input
              placeholder="Type your message here..."
              type="text"
              maxLength={250}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-[57.5vw] max-sm:w-[70vw] max-md:w-[70vw] rounded-[.5vw] input-container outline-none resize px-[1vw] h-[5.5vh] max-sm:px-[1vw] max-sm:h-[3vh] max-md:px-[1vw] max-md:h-[3vh] absolute bottom-[1.7vh] max-sm:bottom-[1vh] max-md:bottom-[1vh] left-[1.5vw] text-[1vw] max-sm:text-[1.5vw] max-md:text-[1.4vw]"
            />
            <span
              className="input-container w-[3.5vw] h-[5.5vh] max-sm:w-[6vw] max-sm:h-[3vh] max-md:w-[6vw] max-md:h-[3vh] rounded-[.5vw] flex justify-center items-center absolute right-[1.5vw] bottom-[1.7vh] max-sm:bottom-[1vh] max-md:bottom-[1vh] cursor-pointer"
              onClick={handleArrowClick}
            >
              <BsSendFill className="check-icon text-[1vw] max-sm:text-[2vw] max-md:text-[1.4vw]" />
            </span>
          </div>
        </div>
      ) : (
        <div className="child-container-2">
          <div className="container-2 font-satoshi text-white w-[65vw] h-[90vh] max-sm:w-[80vw] max-sm:h-[45vh] max-md:w-[80vw] max-md:h-[45vh] flex flex-col justify-center items-center relative overflow-hidden">
            <div className="flex flex-col w-[30vw] p-[2vw] max-sm:w-[50vw] max-sm:h-[50vh] max-md:w-[40vw] max-md:h-[40vh] justify-center items-center object-cover overflow-hidden">
              <img src={noChat} alt="nochat" className="opacity-75" />
              <h1 className="font-normal font-satoshi text-center uppercase text-[1vw] max-sm:text-[2vw] max-md:text-[1.4vw]">
                OPS! There's no channel at this moment. <br />
                Please consider creating one by clicking on the{" "}
                <span className="font-black"> [ + ] </span>
                on your{" "}
                <span className="font-black underline">left sidebar.</span>
              </h1>
            </div>
          </div>
        </div>
      )}
      {popup && (
        <AddChannel togglePopup={togglePopup} addChannel={addChannel} />
      )}
    </div>
  );
};
export const SocketContext = React.createContext<Socket | null>(null);

export default Chat;
