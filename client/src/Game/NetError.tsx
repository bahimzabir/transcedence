const NetError = () => {
    return (
        <div className="pop-up">
            <div className="overlay">
                <div className="pop-up-container">
                    <div className="flex justify-center items-center relative">
                        <div className="add-channel w-[40vw] h-[40vh] max-sm:w-[40vw] max-md:w-[40vw] max-lg:w-[40vw] max-xl:w-[40vw] max-2xl:w-[40vw] text-white font-satoshi flex justify-center items-center overflow-y-scroll no-scrollbar overflow-hidden py-[2vw] max-sm:py-[4vw] max-md:py-[4vw]">
                            <div className="qr-code-container mt-[2vw]">
                                <div className="qr-code">
                                    <div className="flex flex-col justify-between items-center gap-[1.4vw]">
                                        <h3 className="font-medium font-satoshi text-[3vw] text-center">
                                            Network Issue
                                            <br />
                                            Please Check Your Internet
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
export default NetError;
