import { useEffect } from "react";
import "../styles/QrCode.css";
import axios from "axios";
import { notifyoferror } from "../Pages/chatInterfaces";

const VerifyLogin = () => {
    useEffect(() => {
        const form: HTMLElement | null = document.getElementById("form");
        const inputs = form?.querySelectorAll("input");

        function handleInput(e: { target: any }) {
            const input = e.target;
            const nextInput = input.nextElementSibling;
            if (nextInput && input.value) {
                nextInput.focus();
                if (nextInput.value) {
                    nextInput.select();
                }
            }
        }

        function handleBackspace(e: { target: any }) {
            const input = e.target;
            if (input.value) {
                input.value = "";
                return;
            }
            input.previousElementSibling.focus();
        }

        function handleArrowLeft(e: { target: any }) {
            const previousInput = e.target.previousElementSibling;
            if (!previousInput) return;
            previousInput.focus();
        }

        function handleArrowRight(e: { target: any }) {
            const nextInput = e.target.nextElementSibling;
            if (!nextInput) return;
            nextInput.focus();
        }

        form?.addEventListener("input", handleInput);

        inputs?.forEach((input) => {
            input.addEventListener("focus", () => {
                setTimeout(() => {
                    // e.target?.select();
                }, 0);
            });

            input.addEventListener("keydown", (e) => {
                switch (e.key) {
                    case "Backspace" || "8":
                        handleBackspace(e);
                        break;
                    case "ArrowLeft" || "37":
                        handleArrowLeft(e);
                        break;
                    case "ArrowRight" || "39":
                        handleArrowRight(e);
                        break;
                    default:
                }
            });
        });
    }, []);

    const getCodeandVerify = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form: HTMLElement | null = document.getElementById("form");
        const inputs = form?.querySelectorAll("input");
        try {
            let code = "";
            inputs?.forEach((input) => {
                code += input.value;
            });
            console.log(code);
            const res = await axios.post("/api/2fa/authenticate", {
                code: code,
            });
            console.log(res);
            if (res.status === 401) {
                inputs?.forEach((input) => {
                    input.value = "";
                });
            } else {
                window.location.href = "/home";
            }
        } catch (err: any) {
            const errorMsg = err.response.data.message;
            notifyoferror(errorMsg);

            inputs?.forEach((input) => {
                input.value = "";
            });
        }
        
    };

    return (
        <div className="pop-up">
            <div className="overlay">
                <div className="pop-up-container">
                    <div className="flex justify-center items-center relative">
                        <div className="add-channel w-[40vw] h-[40vh] max-sm:w-[40vw] max-md:w-[40vw] max-lg:w-[40vw] max-xl:w-[40vw] max-2xl:w-[40vw] text-white font-satoshi flex justify-center items-center overflow-y-scroll no-scrollbar overflow-hidden py-[2vw] max-sm:py-[4vw] max-md:py-[4vw]">
                            <div className="qr-code-container mt-[2vw]">
                                <div className="qr-code">
                                    <div className="flex flex-col justify-between items-center gap-[1.4vw]">
                                        <h3 className="font-medium font-satoshi text-[1.2vw]">
                                            Please enter the 6-digit code from
                                            the QR to Login
                                        </h3>
                                        <form
                                            id="form"
                                            onSubmit={getCodeandVerify}
                                        >
                                            <div className="flex justify-center items-center">
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                                <input
                                                    type="tel"
                                                    maxLength={1}
                                                    pattern="[0-9]"
                                                    className="form-control"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="verify-btn font-medium font-satoshi text-[1vw]"
                                            >
                                                Login
                                            </button>
                                        </form>
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

export default VerifyLogin;
