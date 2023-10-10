import { Link } from "react-router-dom";
import axios from "axios";

const readNotification = async (id: number) => {
  const data = {
    id: [id],
  };
  await axios.post("/api/users/readnotification", data, {
    withCredentials: true,
  });
};

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
                <Link
                  to={`/view-profile?id=${notification.from}`}
                  onClick={() => readNotification(notification.id)}
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
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
