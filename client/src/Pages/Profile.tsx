import {
    BsFillPersonLinesFill,
    BsGithub,
    BsInstagram,
    BsLinkedin,
} from "react-icons/bs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QrCode } from "./index";
import "../styles/Profile.css";
import { infonotify, notifyoferror } from "./chatInterfaces";
import TurnOffVerify from "../components/TurnOffVerify";
import BlockedFriends from "../components/BlockedFriends";

interface Data {
    photo?: string;
    username?: string;
    fullname?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

interface Body {
    username: string;
    fullname: string;
    bio: string;
    github: string;
    linkedin: string;
    instagram: string;
}

const Profile = () => {
    const emptyBody = {
        username: "",
        fullname: "",
        bio: "",
        github: "",
        linkedin: "",
        instagram: "",
    };

    const [data, setData] = useState<Data>({});
    const [photo, setPhoto] = useState<File>();
    const [body, setBody] = useState<Body>(emptyBody);
    const [save, setSave] = useState<boolean>(false);
    const [isBioEditing, setIsBioEditing] = useState(false);
    const [qrCode, setQrCode] = useState(false);
    const [tfaOn, setTfaOn] = useState<boolean>(false);
    const [off, setOff] = useState(false);

    const toggleQrCode = () => {
        setQrCode(!qrCode);
        getTfaStatus();
    };

    const turnTfOff = () => {
        setOff(!off);
        getTfaStatus();
    };

    const getProfileData = async () => {
        await axios.get("/api/users/me").then((res) => {
            const _data: Data = {
                photo: res.data.photo,
                username: res.data.username,
                fullname: `${res.data.firstname} ${res.data.lastname}`,
                bio: res.data.bio,
                github: res.data.github,
                linkedin: res.data.linkedin,
                instagram: res.data.instagram,
            };
            setData(_data);
            setBody({ ...body, bio: res.data.bio });
        });
    };

    const getTfaStatus = async () => {
        await axios.get("/api/users/tfastatus").then((res) => {
            setTfaOn(res.data);
        });
    };

    useEffect(() => {
        console.log("save");
        getProfileData();
        getTfaStatus();
    }, [save]);

    const handleBioEdit = () => {
        setIsBioEditing(!isBioEditing);
    };

    const handleBioChange = (e: any) => {
        setBody({ ...body, bio: e.target.value });
    };

    const handleBioSave = () => {
        setIsBioEditing(false);
    };

    const handleGithubChange = (e: any) => {
        setBody({ ...body, github: e.target.value });
    };

    const handleLinkedinChange = (e: any) => {
        setBody({ ...body, linkedin: e.target.value });
    };

    const handleInstagramChange = (e: any) => {
        setBody({ ...body, instagram: e.target.value });
    };

    const handleUsernameChange = (e: any) => {
        setBody({ ...body, username: e.target.value });
    };

    const handleFullNameChange = (e: any) => {
        setBody({ ...body, fullname: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData({ ...data, photo: URL.createObjectURL(e.target.files[0]) });
            setPhoto(e.target.files[0]);
        }
    };

    const postData = async () => {
        try {
            let updatedBody: Partial<Body> = Object.entries(body)
                .filter(([, value]) => value !== "")
                .reduce((result, [key, value]) => {
                    result[key as keyof Body] = value;
                    return result;
                }, {} as Partial<Body>);
            if (body.bio === data.bio) {
                const { bio, ...tmpBody } = updatedBody;
                updatedBody = tmpBody;
            }
            if (Object.keys(updatedBody).length !== 0 || photo) {
                const form = new FormData();
                console.log("updated body ==> ", updatedBody);
                form.append("body", JSON.stringify(updatedBody));
                if (photo) form.append("file", photo);
                await axios.post("/api/users/me", form, {
                    withCredentials: true,
                });
                setBody(emptyBody);
                setSave(!save);
                infonotify("your profile updated succefully");
            } else {
                notifyoferror("nothing to update!!");
            }
        } catch (err) {
            notifyoferror("invalid Data");
            console.log(err);
        }
    };

    const navigate = useNavigate();

    const [blockedFriendPopup, setblockedFriendPopup] = useState(false);
    const toggleBlockedFriendsPopup = () => {
        setblockedFriendPopup(!blockedFriendPopup);
    };

    return (
        <div className="parent flex justify-center items-center gap-[1.2vw] h-screen max-sm:flex-col max-md:flex-col max-sm:my-[2vh] max-md:my-[2vh]">
            <div className="child-container-1">
                <div className="container-1 font-satoshi text-white w-[16vw] h-[90vh] max-sm:w-[80vw] max-sm:h-[40vh] max-md:w-[80vw] max-md:h-[40vh] flex flex-col justify-center items-center relative">
                    <div className="img-holder absolute top-[6vw] max-sm:top-[6vw] max-md:top-[3vw]">
                        <label htmlFor="imageInput">
                            <img
                                className="w-[6vw] h-[6vw] max-sm:w-[14vw] max-sm:h-[14vw] max-md:w-[14vw] max-md:h-[14vw] rounded-full cursor-pointer object-cover"
                                src={data?.photo}
                                alt="Apollo"
                            />
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="imageInput"
                        />
                    </div>
                    <h4 className="font-light absolute top-[13vw] opacity-80 text-[.8vw] max-sm:top-[22vw] max-md:top-[18vw] max-sm:text-[1.8vw] max-md:text-[1.8vw]">
                        @{data?.username}
                    </h4>
                    <h3 className="font-bold absolute top-[14.2vw] text-[1vw] max-sm:top-[24.5vw] max-sm:text-[2.4vw] max-md:top-[20.5vw] max-md:text-[2.4vw]">
                        {data?.fullname}
                    </h3>
                    <div className="bio absolute justify-center items-start top-[18vw] mx-[1.2vw] text-[.8vw] max-sm:top-[30vw] max-sm:mx-[4vw] max-sm:text-[1.5vw] max-md:top-[26vw] max-md:mx-[4vw] max-md:text-[1.5vw]">
                        {isBioEditing ? (
                            <>
                                <textarea
                                    className="flex font-normal w-full text-start custom-textarea text-[.9vw] max-sm:text-[2vw] max-sm:w-[72vw] max-sm:h-[12vw] max-md:text-[2vw] max-md:w-[72vw] max-md:h-[12vw]"
                                    value={body?.bio}
                                    maxLength={200}
                                    onChange={handleBioChange}
                                />
                                <button
                                    onClick={handleBioSave}
                                    className="float-right mt-[1vw] max-sm:mt-[1.5vw] max-md:mt-[1.5vw] font-medium underline"
                                >
                                    save
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="font-normal w-full text-start text-[.9vw] max-sm:text-[2vw] max-md:text-[2vw]">
                                    {body.bio}
                                </p>
                                <button
                                    className="float-right mt-[1vw] max-sm:mt-[1.5vw] max-md:mt-[1.5vw] font-medium underline"
                                    onClick={handleBioEdit}
                                >
                                    edit bio
                                </button>
                            </>
                        )}
                    </div>

                    <ul className="flex gap-[2vw] max-sm:gap-[4vw] max-md:gap-[4vw] absolute bottom-[6vw] max-sm:bottom-[6vw] max-md:bottom-[3.5vw]">
                        <li>
                            <a href={data?.github} target="_blank">
                                <BsGithub className="text-[1vw] max-sm:text-[2.5vw] max-md:text-[2.5vw]" />
                            </a>
                        </li>
                        <li>
                            <a href={data?.linkedin} target="_blank">
                                <BsLinkedin className="text-[1vw] max-sm:text-[2.5vw] max-md:text-[2.5vw]" />
                            </a>
                        </li>
                        <li>
                            <a href={data?.instagram} target="_blank">
                                <BsInstagram className="text-[1vw] max-sm:text-[2.5vw] max-md:text-[2.5vw]" />
                            </a>
                        </li>
                        <li>
                            <a onClick={toggleBlockedFriendsPopup}>
                                <BsFillPersonLinesFill className="text-[1vw] max-sm:text-[2.5vw] max-md:text-[2.5vw] hover:cursor-pointer" />
                            </a>
                        </li>
                    </ul>
                    {blockedFriendPopup && (
                        <BlockedFriends
                            toggleBlockedFriendsPopup={
                                toggleBlockedFriendsPopup
                            }
                        />
                    )}
                </div>
            </div>
            <div className="child-container-2">
                <div className="container-2 font-satoshi text-white w-[65vw] h-[90vh] max-sm:w-[80vw] max-sm:h-[60vh] max-md:w-[80vw] max-md:h-[60vh] flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center gap-[1vw] max-sm:gap-[3vw] max-sm:flex-col max-sm:w-full max-md:gap-[3vw] max-md:flex-col max-md:w-full">
                        <div className="editable w-full max-sm:px-[3vw] max-md:px-[3vw]">
                            <h3 className="text-[1vw] max-sm:text-[2.2vw] max-md:text-[2.2vw] font-satoshi font-medium uppercase">
                                username
                            </h3>
                            <div className="flex mt-[.5vw]">
                                <input
                                    placeholder="username"
                                    onChange={handleUsernameChange}
                                    value={body.username}
                                    type="text"
                                    maxLength={24}
                                    className="w-[24vw] h-[3vw] max-sm:h-[3vh] max-md:h-[3vh] rounded-[.6vw] input-container outline-none indent-[1vw] max-sm:w-full max-sm:text-[2vw] max-md:w-full max-md:text-[2vw]"
                                />
                            </div>
                        </div>
                        <div className="editable w-full max-sm:px-[3vw] max-md:px-[3vw]">
                            <h3 className="text-[1vw] max-sm:text-[2.2vw] max-md:text-[2.2vw] font-satoshi font-medium uppercase">
                                full name
                            </h3>
                            <div className="flex mt-[.5vw]">
                                <input
                                    placeholder="full name"
                                    value={body.fullname}
                                    onChange={handleFullNameChange}
                                    type="text"
                                    maxLength={24}
                                    className="w-[24vw] h-[3vw] max-sm:h-[3vh] max-md:h-[3vh] rounded-[.6vw] input-container outline-none indent-[1vw] max-sm:w-full max-sm:text-[2vw] max-md:w-full max-md:text-[2vw]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="editable flex flex-col mt-[2.5vw] max-sm:mt-[5vw] max-sm:w-full max-md:mt-[5vw] max-md:w-full">
                        <h3 className="text-[1vw] max-sm:text-[2.2vw] max-md:text-[2.2vw] font-satoshi font-medium max-sm:pl-[2.8vw] max-md:pl-[2.8vw] uppercase">
                            social links
                        </h3>
                        <div className="flex gap-[1vw] mt-[1vw] max-sm:px-[2.8vw] max-md:px-[2.8vw]">
                            <span className="check-span w-[6vw] h-[3vw] rounded-[.6vw] text-[1vw] flex justify-center items-center font-normal max-sm:hidden max-md:hidden">
                                github
                            </span>
                            <div className="flex max-sm:w-full max-md:w-full">
                                <input
                                    placeholder="github link"
                                    value={body.github}
                                    onChange={handleGithubChange}
                                    type="link"
                                    className="w-[42vw] max-sm:w-full max-md:w-full h-[3vw] max-sm:h-[3vh] max-md:h-[3vh] rounded-[.6vw] input-container outline-none indent-[1vw] max-sm:text-[2vw] max-md:text-[2vw]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-[1vw] mt-[1vw] max-sm:px-[2.8vw] max-md:px-[2.8vw]">
                            <span className="check-span w-[6vw] h-[3vw] rounded-[.6vw] text-[1vw] flex justify-center items-center font-normal max-sm:hidden max-md:hidden">
                                linkedin
                            </span>
                            <div className="flex max-sm:w-full max-md:w-full">
                                <input
                                    placeholder="linkedin link"
                                    value={body.linkedin}
                                    onChange={handleLinkedinChange}
                                    type="link"
                                    className="w-[42vw] max-sm:w-full max-md:w-full h-[3vw] max-sm:h-[3vh] max-md:h-[3vh] rounded-[.6vw] input-container outline-none indent-[1vw] max-sm:text-[2vw] max-md:text-[2vw]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-[1vw] mt-[1vw] max-sm:px-[2.8vw] max-md:px-[2.8vw]">
                            <span className="check-span w-[6vw] h-[3vw] rounded-[.6vw] text-[1vw] flex justify-center items-center font-normal max-sm:hidden max-md:hidden">
                                instagram
                            </span>
                            <div className="flex max-sm:w-full max-md:w-full">
                                <input
                                    placeholder="instagram link"
                                    value={body.instagram}
                                    onChange={handleInstagramChange}
                                    type="link"
                                    className="w-[42vw] max-sm:w-full max-md:w-full h-[3vw] max-sm:h-[3vh] max-md:h-[3vh] rounded-[.6vw] input-container outline-none indent-[1vw] max-sm:text-[2vw] max-md:text-[2vw]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-[2.5vw] w-[49vw] max-sm:mt-[6vw] max-sm:w-full max-sm:px-[2.8vw] max-md:mt-[6vw] max-md:w-full max-md:px-[2.8vw]">
                        <span className="text-[1vw] max-sm:text-[2.2vw] max-md:text-[2.2vw] font-medium font-satoshi uppercase">
                            {tfaOn ? "disable" : "enable"} 2 factor
                            authentication
                        </span>
                        <div className="containerr">
                            <div className="switches-container">
                                <input
                                    type="radio"
                                    id="switchOff"
                                    name="switchPlan"
                                    value="Off"
                                    checked={!tfaOn}
                                    onChange={getTfaStatus}
                                />
                                <input
                                    type="radio"
                                    id="switchOn"
                                    name="switchPlan"
                                    value="On"
                                    checked={tfaOn}
                                    onChange={getTfaStatus}
                                />
                                <label htmlFor="switchOff" onClick={turnTfOff}>
                                    OFF
                                </label>
                                <label
                                    htmlFor="switchOn"
                                    onClick={toggleQrCode}
                                >
                                    ON
                                </label>
                                <div className="switch-wrapper">
                                    {/* <div className="switch"></div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {qrCode && <QrCode toggleQrCode={toggleQrCode} />}
                    {off && <TurnOffVerify turnTfOff={turnTfOff} />}
                    <div className="mt-[3vw] w-[49vw] max-sm:mt-[8vw] max-sm:w-full max-sm:pr-[2.8vw] max-md:mt-[8vw] max-md:w-full max-md:pr-[2.8vw]">
                        <div className="child flex gap-[4vw] justify-end items-center">
                            <h3 className="font-light text-[1vw] max-sm:text-[2vw] max-md:text-[2vw]">
                                <a
                                    className=" hover:cursor-pointer"
                                    onClick={() => navigate("/home")}
                                >
                                    CANCEL
                                </a>
                            </h3>
                            <h3 className="font-bold text-[1.3vw] max-sm:text-[2.5vw] max-md:text-[2.5vw]">
                                <a
                                    className="hover:cursor-pointer"
                                    onClick={postData}
                                >
                                    SAVE
                                </a>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
