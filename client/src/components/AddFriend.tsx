import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
//-------------------PROPS---------------------
import "react-toastify/dist/ReactToastify.css";
import { badnotify, notify } from "../assets/toastNotifys";
//-------------------PROPS---------------------

interface AddFriendProps {
    toggleAddFriendPopup: () => void;
    socket: Socket | null;
    roomid: number;
    roomname: string;
}
interface Friends {
    id: number;
    photo: string;
    username: string;
}

const AddFriend = ({
    toggleAddFriendPopup,
    socket,
    roomid,
    roomname,
}: AddFriendProps) => {
    const [friend, setFreinds] = useState<Friends[]>([]);
    const getallmyfriends = async () => {
        const res = await axios.get("/api/users/me/friends", {
            withCredentials: true,
        });
        return res.data;
    };
    const setallmyfreindsPopup = async () => {
        const allmyfreinds = await getallmyfriends();
        let members: Friends[] = [];
        allmyfreinds.friends.forEach((user: Friends) => {
            members = [
                ...members,
                { id: user.id, photo: user.photo, username: user.username },
            ];
        });
        setFreinds(members);
    };

    useEffect(() => {
        setallmyfreindsPopup();
    }, []);
    const handleInviteClick = async (id: number) => {
        const dto = {
            roomid: roomid,
            userid: id,
            roomname: roomname,
        };
        socket?.emit("invite", dto, {
            withCredentials: true,
        });
    };
    const isadmin: boolean = true;
    useEffect(() => {
        socket?.on("success", () => {
            notify("request sent");
        });
        socket?.on("warning", () => {
            badnotify("request already sent");
        });
    }, []);

    return (
        <div className="pop-up">
            {isadmin && (
                <div className="overlay">
                    <div className="pop-up-container">
                        <div className="flex justify-center items-center relative">
                            <div className="add-channel w-[30em] h-[30vw] max-sm:w-[60vw] max-sm:h-[30vw] max-md:w-[60vw] max-md:h-[30vw] max-lg:w-[50vw] max-lg:h-[30vw] max-xl:w-[50vw] max-xl:h-[30vw] text-white font-satoshi flex justify-center items-center py-[5vw] max-sm:py-[2vw] max-md:py-[2vw] max-lg:py-[2vw]">
                                <div className="pop-up w-[25em] max-sm:w-full max-md:w-full flex flex-col gap-[1vw] max-sm:gap-[1.5vw] max-md:gap-[2vw] max-xl:gap-[2vw] mx-[2vw] max-sm:mx-[4vw] max-md:mx-[4vw] max-lg:mx-[4vw] max-xl:mx-[1vw]">
                                    <h3 className="text-[1em] text-center uppercase font-semibold max-sm:text-[2.5vw] max-md:text-[1.8vw] max-lg:text-[1.8vw] max-xl:text-[1.8vw]">
                                        Invite Friends
                                    </h3>
                                    <div className="flex flex-col items-center justify-start h-[20vw] overflow-y-scroll no-scrollbar overflow-hidden pb-[1vw]">
                                        {friend.map((user) => (
                                            <div
                                                key={user.id}
                                                className="w-full container-1 flex justify-between items-center py-[.6vw] px-[1vw]"
                                            >
                                                <Link
                                                    to={`/view-profile?id=${user.id}`}
                                                >
                                                    <div className="flex justify-between items-center gap-[.6vw] max-sm:gap-[2vw] max-md:gap-[2vw] max-lg:gap-[2vw]">
                                                        <img
                                                            className="w-[2.5vw] h-[2.5vw] max-sm:w-[7vw] max-sm:h-[7vw] max-md:w-[4vw] max-md:h-[4vw] max-lg:w-[4vw] max-lg:h-[4vw] rounded-full"
                                                            src={user.photo}
                                                        />
                                                        <p className="font-satoshi font-medium hover:underline text-[.9vw] max-sm:text-[1vh] max-md:text-[1.1vh] max-lg:text-[1.1vh]">
                                                            {user.username}
                                                        </p>
                                                    </div>
                                                </Link>
                                                <button
                                                    className="container-1 rounded-[.3vw] max-sm:rounded-[.2vw] max-md:rounded-[.2vw] max-lg:rounded-[.2vw] max-xl:rounded-[.2vw] px-[1.2vw] max-sm:px-[1vw] max-md:px-[1vw] max-lg:px-[1vw] max-xl:px-[1vw] py-[.2vw] max-sm:py-[.5vw] max-md:py-[.5vw] max-lg:py-[.5vw] max-xl:py-[.5vw] hover:scale-105"
                                                    onClick={() =>
                                                        handleInviteClick(
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    <h3 className="font-bold text-[.8vw] max-sm:text-[1.5vw] max-md:text-[1.5vw] max-lg:text-[1.5vw] max-xl:text-[1.5vw]">
                                                        INVITE
                                                    </h3>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="max-sm:mt-[1vw] max-md:pt-[.5vw]">
                                        <div className="child flex items-center justify-end gap-[2vw] max-sm:gap-[8vw] max-md:gap-[6vw] max-lg:gap-[2vw] max-xl:gap-[2vw]">
                                            <h3 className="text-[1vw] font-bold max-sm:text-[2.5vw] max-md:text-[1.8vw] max-lg:text-[1.8vw] max-xl:text-[1.8vw]">
                                                <a
                                                    className="cursor-pointer"
                                                    onClick={
                                                        toggleAddFriendPopup
                                                    }
                                                >
                                                    DONE
                                                </a>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFriend;
