interface Player {
    photo: string;
    username: string;
}

interface Game {
    player1Id: number;
    player2Id: number;
    player1Score: number;
    player2Score: number;
    type: string;
}

interface MatchCardProps {
    game: Game;
    index: number;
    map: Map<number, Player>;
}

const MatchCard = ({ map, game, index }: MatchCardProps) => {
    return (
        <div
            key={index}
            className="game-div mt-[1vw] max-sm:mt-[2.5vw] max-md:mt-[2vw] max-lg:mt-[2vw] flex container-1 px-[2vw] py-[.5vw] max-sm:py-[1vh] max-md:py-[1vh] max-lg:py-[1vh] justify-between items-center w-full"
            title="Click to watch the game"
        >
            <div className="flex items-center justify-start gap-[7vw] max-sm:gap-[1vw] max-md:gap-[1vw] max-lg:gap-[1vw] w-1/2">
                <div className="flex items-center justify-start">
                    <img
                        className="ppic rounded-full w-[3vw] h-[3vw] max-sm:w-[7vw] max-sm:h-[7vw] max-md:w-[5vw] max-md:h-[5vw] max-lg:w-[3.5vw] max-lg:h-[3.5vw] mr-[1vw] object-cover"
                        src={map.get(game.player1Id)?.photo}
                        alt="profile-pic"
                    />
                    <h2 className="username font-medium font-satoshi text-[.8vw] max-sm:text-[1.2vh] max-md:text-[1.2vh] max-lg:text-[1.2vh]">
                        {map.get(game.player1Id)?.username}
                    </h2>
                </div>
            </div>
            <h1 className="font-black font-satoshi text-[1vw] max-sm:text-[1.4vh] max-md:text-[1.4vh] max-lg:text-[1.4vh]">
                {(game.player1Score === -1) ? 'dis' : game.player1Score}
            </h1>
            <h1 className="font-black font-satoshi text-[1vw] max-sm:text-[1.4vh] max-md:text-[1.4vh] max-lg:text-[1.4vh] text-center w-[30vw]">
                VS
            </h1>
            <h1 className="font-black font-satoshi text-[1vw] max-sm:text-[1.4vh] max-md:text-[1.4vh] max-lg:text-[1.4vh]">
                {(game.player2Score === -1) ? 'dis' : game.player2Score}
            </h1>
            <div className="flex items-center justify-end gap-[7vw] max-sm:gap-[1vw] max-md:gap-[1vw] max-lg:gap-[1vw] w-1/2">
                <div className="flex justify-end items-center">
                    <h2 className="username font-medium font-satoshi text-[.8vw] max-sm:text-[1.2vh] max-md:text-[1.2vh] max-lg:text-[1.2vh]">
                        {map.get(game.player2Id)?.username}
                    </h2>
                    <img
                        className="ppic rounded-full w-[3vw] h-[3vw] max-sm:w-[7vw] max-sm:h-[7vw] max-md:w-[5vw] max-md:h-[5vw] max-lg:w-[3.5vw] max-lg:h-[3.5vw] ml-[1vw] object-cover"
                        src={map.get(game.player2Id)?.photo}
                        alt="profile-pic"
                    />
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
