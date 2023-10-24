import { useNavigate } from "react-router-dom";
import axios from "axios";
import { infonotify, notifyoferror } from "../Pages/chatInterfaces";

const NotificationCount = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <div className="bg-red-600 font-bold font-satoshi absolute -top-[.7vw] -right-[.5vw] text-[.6vw] w-[1vw] h-[1vw] text-center rounded-full">
      {count}
    </div>
  );
};

type NotificationProps = {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  from: number;
  type: string;
  roomid: number;
  message: string;
  photo: string;
  username: string;
  read: boolean;
};

const Notifications = ({
  notifications,
}: {
  notifications: NotificationProps[];
}) => {
  const navigate = useNavigate();
  const readNotification = async (notification: NotificationProps) => {
    if(notification.type === "roomrequest")
    {    
      try{
        const res = await axios.post("api/chat/joinByinvt", {roomid: notification.roomid}, {
          withCredentials: true,
        })
        infonotify("You joined the room")
        const data = {
          id: [notification.id],
        };
        await axios.post("/api/users/readnotification", data, {
          withCredentials: true,
        });
        navigate('/chat')
      }
      catch(error:any){
        if(error.code === 'ERR_BAD_REQUEST')
          notifyoferror(error.response.data.message)
        else
          notifyoferror(error.message)
      }
    }
    else{
      const data = {
        id: [notification.id],
      };
      await axios.post("/api/users/readnotification", data, {
        withCredentials: true,
      });
      navigate("/view-profile?id=" + notification.from)
    }
  };
  const unreadNotifications = notifications.filter(
    (notification) => notification.read === false
    );
  return (
    <>
      <NotificationCount count={unreadNotifications.length} />
      <div className="box notification-box overflow-y-scroll no-scrollbar w-[20vw]">
        <div className="display">
          <div className="cont">
            {unreadNotifications.map((notification) => (
              <div
              key={notification.id}
                className="container-1 m-[.6vw] p-[.5vw] flex justify-center items-center"
              >
                <button

                  onClick={() => readNotification(notification)}
                >
                  <div className="flex justify-between items-center gap-[.6vw] max-sm:gap-[2vw] max-md:gap-[2vw] max-lg:gap-[2vw]">
                    <img
                      className="w-[2.5vw] h-[2.5vw] max-sm:w-[7vw] max-sm:h-[7vw] max-md:w-[4vw] max-md:h-[4vw] max-lg:w-[4vw] max-lg:h-[4vw] rounded-full"
                      src={notification.photo}
                    />
                    <p className="font-satoshi font-normal text-[.8vw] max-sm:text-[1vh] max-md:text-[1.1vh] max-lg:text-[1.1vh]">
                      {notification.message}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
