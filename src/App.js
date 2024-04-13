import React,{useEffect, useState} from 'react';
import './App.css';

import ChatLog from './components/ChatLog.js';
import Console from './components/Console.js';

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
        if (inputState == 'type') {
            setInputState('read')
            addLogEntry("Clive here!", 'clive')
        }
        if (inputState == 'read') {
            setInputState('type')
            buildTextAll()
        }
    }

    useEffect(() => {
        if (logData.queue.length > 0) {
            setTimeout(buildText, 20)
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
            />
        </>
    );
}

export default App;
