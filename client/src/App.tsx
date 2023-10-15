import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
    Profile,
    Landing,
    Chat,
    ViewProfile,
    GameMode,
    Dashboard,
    Challenge,
    Practice,
} from "./Pages/index";
import AddChannel from "./components/AddChannel";
import "./App.css";
import Game from "./Game/Game";
import { setOnline, recieveNotification } from "./components/mainGateway";
import { ToastContainer } from "react-toastify";

const App = () => {
    setOnline();
    recieveNotification();
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/gamemode" element={<GameMode />} />
                <Route path="/game" element={<Game />} />
                <Route path="/challenge" element={<Challenge />} />
                <Route path="/practice" element={<Practice />}/>
                <Route path="/home" element={<Dashboard />} />
                <Route
                    path="/add-channel"
                    element={
                        <AddChannel
                            togglePopup={function (): void {
                                throw new Error("Function not implemented.");
                            }}
                            addChannel={function (_channelProps: {
                                name: string;
                                img: File | null;
                            }): void {
                                throw new Error("Function not implemented.");
                            }}
                        />
                    }
                />
                <Route path="/view-profile" element={<ViewProfile />} />
            </Routes>
            <ToastContainer/>
        </BrowserRouter>
    );
};

export default App;
