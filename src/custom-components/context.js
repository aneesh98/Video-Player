import React, { useState, useEffect, useContext, createContext } from 'react';
const ipc = window.require('electron').ipcRenderer;

const videoContext = createContext();
export function VideoContext({ children }) {
    const auth = useProvideAuth();
    return <videoContext.Provider value={auth}>{children}</videoContext.Provider>;
}
export const useVideoSrc = () => useContext(videoContext);
//This is a custom hook
function useProvideAuth() {
    const [videoSrc, setVideoSrc] = useState('');


    const changeVideoSource = (src) => {
        setVideoSrc(src);
    }
    
    return {
        videoSrc
    };
}
