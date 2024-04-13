import React,{useEffect, useState} from 'react';
import './App.css';

import ChatLog from './components/ChatLog.js';
import Console from './components/Console.js';
import TabMonitor from './components/TabMonitor.js';
import { getJurorData } from './helpers/juror.js';
import { playVoice } from './helpers/voice.js';

const CHAT_SPEED = 18
const CHAT_SOUND_RATE = 2

function getSave() {
    let FAILCASE = {
        history: [],
        commands: ["help", "back", "jurors", "interview", "evidence", "inspect", "select"],
        topics: {},
        qualities: {},
    }
    try {
        let ret = JSON.parse(localStorage.getItem("save"))
        if (!ret) {
            ret = FAILCASE
        }
        return ret
    }
    catch (e) {
        return FAILCASE
    }
}

function App() {
    const [logData, setLogData] = useState({log: [], queue: ""})
    const [userText, setUserText] = useState("")
    const [inputState, setInputState] = useState('type')
    const [isTabVisible, setIsTabVisible] = useState(true)
    // const [isMuted, setIsMuted] = useState(false)

    function buildTextAll() {
        setLogData(prevLogData => ({
            log: prevLogData.log.map((logEntry, i) => {
                if (i === prevLogData.log.length-1) {
                    const ret = {
                        ...logEntry,
                        text: logEntry.text + prevLogData.queue,
                    }
                    return ret
                }
                return logEntry
            }),
            queue: "",
        }))
    }

    function buildText() {
        if (logData.queue.length % CHAT_SOUND_RATE === 1) {
            if (isTabVisible) {
                playVoice(getSpeakerData().properties.voice)
            }
        }
        setLogData(prevLogData => ({
            log: prevLogData.log.map((logEntry, i) => {
                if (i === prevLogData.log.length-1) {
                    const ret = {
                        ...logEntry,
                        text: logEntry.text + (prevLogData.queue[0] || ""),
                    }
                    return ret
                }
                return logEntry
            }),
            queue: prevLogData.queue.substring(1),
        }))
    }

    function setQueuedText(text) {
        setLogData(prevLogData => ({
            ...prevLogData,
            queue: text,
        }))
    }

    function addLogEntry(text, speaker) {
        const newEntry = {
            text: "",
            speaker: speaker,
            key: logData.length,
        }
        setQueuedText(text)
        setLogData(prevLogData => ({
            ...prevLogData,
            log: [...prevLogData.log, newEntry]
        }));
    }

    function executeConfirm() {
        if (inputState === 'type') {
            setInputState('read')
            addLogEntry("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv", 'clive')
        }
        if (inputState === 'read') {
            setInputState('type')
            buildTextAll()
        }
    }

    function getSpeakerData() {
        return getJurorData(logData.log?.[logData.log.length-1].speaker)
    }

    // function toggleMute() {
    //     setIsMuted(prevIsMuted => !prevIsMuted)
    // }

    useEffect(() => {
        if (logData.queue.length > 0) {
            const speakerData = getSpeakerData()
            const speedMultiplier = speakerData.properties.textSpeedMultiplier
            setTimeout(buildText, CHAT_SPEED / speedMultiplier)
        }
        else {
            setInputState('type')
        }
    }, [logData])

    return (
        <>
            <ChatLog
                logData={logData}
            />
            <Console
                text={userText}
                inputState={inputState}
                onChange={setUserText}
                onConfirm={executeConfirm}
                // soundMuted={isMuted}
                // onToggleMute={toggleMute}
            />
            <TabMonitor onChangeVisibility={setIsTabVisible}/>
        </>
    );
}

export default App;
