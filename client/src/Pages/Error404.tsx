import { Link } from "react-router-dom";

const Error404 = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen absolute">
            <Link to="/home">
                <h1 className="absolute top-[2vw] left-[2vw] font-satoshi font-bold text-[1vw] max-sm:text-[2vw] max-md:text-[1.5vw] max-lg:text-[1.5vw] max-xl:text-[1.5vw] px-[1.2vw] max-sm:px-[1vw] max-md:px-[1vw] max-lg:px-[1vw] max-xl:px-[1vw] py-[.2vw] max-sm:py-[.5vw] max-md:py-[.5vw] max-lg:py-[.5vw] max-xl:py-[.5vw] hover:scale-105 hover:cursor-pointer">
                    ← Go back home
                </h1>
            </Link>
            <img src="https://i.imgflip.com/81oo0o.jpg" title="error 404" />
        </div>
    );
};

export default Error404;
