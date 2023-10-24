import { ReactP5Wrapper } from "@p5-wrapper/react";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import GameField from "./GameField";
import axios from "axios";
import "../styles/Game.css";
import { Link, useNavigate } from "react-router-dom";
import { BsArrowLeftShort } from "react-icons/bs";

interface Ball {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    speed: number;
}

interface GameData {
    ball: Ball;
    leftPlayerY: number;
    rightPlayerY: number;
    leftScore: number;
    rightScore: number;
}

interface PlayerData {
    username: string;
    photo: string;
}

function Spectate() {
    const [start, setStart] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const [data, setData] = useState<GameData>();
    const [playerOne, setPlayerOne] = useState<PlayerData>();
    const [playerTwo, setPlayerTwo] = useState<PlayerData>();
    const [scale, setScale] = useState<number>(1);
    const [endMatch, setEndMatch] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleWindowResize = () => {
        if (window.innerWidth <= 600) {
            setScale(0.4);
        } else if (window.innerWidth <= 800) {
            setScale(0.5);
        } else if (window.innerWidth <= 1000) {
            setScale(0.6);
        } else if (window.innerWidth <= 1400) {
            setScale(0.8);
        } else {
            setScale(1);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const mode = queryParams.get("mode");
        if (mode === 'classic')
            setSocket(io("/game"));
        else if (mode === 'speed')
            setSocket(io("/speed"));
        else
            navigate('/*');
    }, []);

    useEffect(() => {
        handleWindowResize();
        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        let roomName = queryParams.get("roomname");

        socket?.emit("spectate", {roomName});
        socket?.on("join_room", (obj: any) => {
            console.log("JOINING ROOM ...");
            setData(obj.data);

            axios
                .get(
                    `/api/users/userinfos?id=${obj.playerOneId}`,
                    { withCredentials: true }
                )
                .then((res) => {
                    setPlayerOne({
                        username: res.data.username,
                        photo: res.data.photo,
                    });
                });

            axios
                .get(
                    `/api/users/userinfos?id=${obj.playerTwoId}`,
                    { withCredentials: true }
                )
                .then((res) => {
                    setPlayerTwo({
                        username: res.data.username,
                        photo: res.data.photo,
                    });
                });

            setStart(true);
        });

        socket?.on("no_room", () => {
            navigate("/*");
        });

        socket?.on("update", (data: GameData) => {
            setData(data);
        });

        socket?.on("endMatch", () => {
            setEndMatch(true);
        });

        return () => {
            socket?.off("update");
            socket?.off("join_room");
            socket?.disconnect();
        };
    }, [socket]);

    if (endMatch) {
        socket?.disconnect();
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen absolute">
                <h2 className="font-bold font-satoshi text-[1.5vw] text-center leading-[2.2vw]">
                    The match has ended.
                    <br />
                    You can go back to your Home Page
                </h2>
                <div className="flex gap-[3vw] mt-[2vw]">
                    <button
                        className="hover:scale-105 text-white font-bold font-satoshi w-[10vw] h-[3vw] container-1 text-[1vw]"
                        onClick={() => navigate("/home")}
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    }
    else if (start) {
        return (
            <div className="bg-black h-screen flex flex-col py-12 items-center justify-center space-y-4  overflow-y-scroll">
                {/* This Link ain't working, Need to FIX!!!! */}
                <Link to="/home">
                <div className="absolute top-12 left-12 flex items-center space-x-2">
                    <BsArrowLeftShort className="w-10 h-10"/>
                    <span className="font-bold font-satoshi text-white text-xl font-bold">
                        leave the match
                    </span>
                </div>
                </Link>
                <div className="flex space-x-16 lg:space-x-48 items-center">
                    <span className="flex flex-col items-center space-y-2">
                        <img
                            src={playerOne?.photo}
                            className="h-16 lg:h-20 w-16 lg:w-20 rounded-full"
                        />
                        <span className="font-bold font-satoshi text-white text-lg">
                            {playerOne?.username}
                        </span>
                    </span>
                    <span className="font-black font-satoshi text-4xl lg:text-6xl text-white">
                        VS
                    </span>
                    <span className="flex flex-col items-center space-y-2">
                        <img
                            src={playerTwo?.photo}
                            className="h-16 lg:h-20 w-16 lg:w-20 rounded-full"
                        />
                        <span className="font-bold font-satoshi text-white text-lg">
                            {playerTwo?.username}
                        </span>
                    </span>
                </div>
                <div className="canvas">
                    <ReactP5Wrapper
                        sketch={GameField}
                        leftPlayerY={data?.leftPlayerY}
                        rightPlayerY={data?.rightPlayerY}
                        ball={data?.ball}
                        scale={scale}
                    />
                </div>
                <div className="flex flex-col items-center gap-6">
                    <span className="font-bold font-satoshi text-2xl lg:text-4xl text-white">
                        Scooooooore
                    </span>
                    <div className="flex space-x-16 lg:space-x-48 items-center">
                        <span className="font-black font-satoshi text-white text-2xl lg:text-4xl">
                            {data?.leftScore}
                        </span>
                        <span className="font-medium font-satoshi text-white text-2xl lg:text-4xl">
                            -
                        </span>
                        <span className="font-black font-satoshi text-white text-2xl lg:text-4xl">
                            {data?.rightScore}
                        </span>
                    </div>
                </div>
            </div>
        );
    } 
}

export default Spectate;
