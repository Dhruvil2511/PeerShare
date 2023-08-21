import React, { createContext, useContext, useState } from "react";

const VideoButtonClickContext = createContext();

const VideoButtonContext = ({ children }) => {
    const [isButtonClicked, setButtonClicked] = useState(false);
    const resetButtonClicked = () => {
        setButtonClicked(false);
      };
    return (
        <div>
            <VideoButtonClickContext.Provider value={{ isButtonClicked, setButtonClicked,resetButtonClicked }}>
                {children}
            </VideoButtonClickContext.Provider>
        </div>
    )
}
export default VideoButtonContext;
export const useButtonClick = () => {
    return useContext(VideoButtonClickContext);
};