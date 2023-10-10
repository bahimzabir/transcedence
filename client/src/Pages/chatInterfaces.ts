import { toast } from "react-toastify";

export enum classSystemEnum {
    OWNER = 3,
    ADMIN = 2,
    NORMAL = 1,
}

export interface messagedto {
    message: string;
    isSentByMe: boolean;
    img: string;
    sender: number;
    roomid: number;
    date: string;
}

export interface MemberProps {
    username: string;
    img: string;
    isAdmin: boolean;
    id: number;
    roomid: number;
}

export interface intersetchannel {
    name: string;
    img: string | File;
    id: number;
    status: string;
    notification: boolean
}
export interface intermessages {
    message: string;
    isSentByMe: boolean;
    img: string;
    date: string;
}
export interface userevents {
    id: number;
    roomid: number;
}

export const notifyoferror = (val: string) => {
    toast.error(`✴️ ${val}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });
};

export const infonotify = (val: string) => {
    toast(val, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
    });
}