import { useState } from "react";

interface PasswordPopupProps {
    togglePopup: () => void;
    setPopupsave: (val: boolean) => void;
    setPassword: (val: string) => void;
}

const PasswordPopup = ({
    togglePopup,
    setPopupsave,
    setPassword,
}: PasswordPopupProps) => {
    // Initialize password with roompassword
    const [password, setpassword] = useState<string>("");
    const handleChange = async (e: any) => {
        setpassword(e.target.value);
    };
    const handleSave = async () => {
        setPassword(password);
        setPopupsave(true);
    };
    return (
        <div className="pop-up z-50">
            <div className="overlay">
                <div className="pop-up-container">
                    <div className="flex justify-center items-center relative">
                        <div className="add-channel w-[30vw] h-[15vw] max-sm:w-[60vw] max-sm:h-[30vw] max-md:w-[60vw] max-md:h-[30vw] max-lg:w-[50vw] max-lg:h-[30vw] max-xl:w-[50vw] max-xl:h-[30vw] text-white font-satoshi flex justify-center items-center overflow-y-scroll no-scrollbar overflow-hidden py-[5vw] max-sm:py-[2vw] max-md:py-[2vw] max-lg:py-[2vw]">
                            <div className="pop-up w-[25vw] max-sm:w-full max-md:w-full flex flex-col gap-[1vw] max-sm:gap-[1.5vw] max-md:gap-[2vw] max-xl:gap-[2vw] mx-[2vw] max-sm:mx-[4vw] max-md:mx-[4vw] max-lg:mx-[4vw] max-xl:mx-[1vw]">
                                <h3 className="text-[1vw] text-center uppercase font-semibold max-sm:text-[2.5vw] max-md:text-[1.8vw] max-lg:text-[1.8vw] max-xl:text-[1.8vw]">
                                    Join Channel
                                </h3>
                                <div className="flex flex-col items-start mt-[1vw]">
                                    <h3 className="text-[1vw] uppercase max-sm:text-[2vw] max-md:text-[1.5vw] max-lg:text-[1.5vw] max-xl:text-[1.5vw]">
                                        Please enter the password
                                    </h3>
                                    <input
                                        onChange={handleChange}
                                        type="text"
                                        maxLength={25}
                                        className="w-full h-[3vw] mt-[.8vw] max-sm:w-full max-sm:h-[3vh] max-md:w-full max-md:h-[5vh] max-lg:w-full max-lg:h-[5vh] max-xl:h-[5vh] rounded-[.5vw] input-container outline-none indent-[1vw] text-[1vw] max-sm:text-[3vw] max-md:text-[2vw] max-lg:text-[3vw] max-xl:text-[2vw]"
                                    />
                                </div>
                                <div className="mt-[.8vw] max-sm:mt-[1vw] max-md:pt-[.5vw]">
                                    <div className="child flex items-center justify-end gap-[2vw] max-sm:gap-[8vw] max-md:gap-[6vw] max-lg:gap-[2vw] max-xl:gap-[2vw]">
                                        <h3 className="text-[.8vw] font-light max-sm:text-[2.5vw] max-md:text-[1.5vw] max-lg:text-[1.5vw] max-xl:text-[1.5vw]">
                                            <a
                                                className="cursor-pointer"
                                                onClick={togglePopup}
                                            >
                                                CANCEL
                                            </a>
                                        </h3>
                                        <h3 className="text-[1.2vw] font-bold max-sm:text-[2.5vw] max-md:text-[1.8vw] max-lg:text-[1.8vw] max-xl:text-[1.8vw]">
                                            <a
                                                className="cursor-pointer"
                                                onClick={handleSave}
                                            >
                                                SAVE
                                            </a>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordPopup;
