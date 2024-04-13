import React,{useEffect, useState} from 'react';
import './App.css';

import ChatLog from './components/ChatLog.js';
import Console from './components/Console.js';
import TabMonitor from './components/TabMonitor.js';
import { getJurorData } from './helpers/juror.js';
import { playVoice } from './helpers/voice.js';
import { parseCommand } from './helpers/command.js';

const CHAT_SPEED = 18
const CHAT_SOUND_RATE = 2

function loadSave() {
    let FAILCASE = {
        history: [],
        commandsUnlocked: ["help", "back", "interview", "examine", "reference", "select"],
        topics: {},
        qualities: {},
        settings: {
            volume: 80
        }
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

function writeSave(saveData) {
    localStorage.setItem("save", JSON.stringify(saveData))
}

function App() {
    const [logData, setLogData] = useState({log: [], queue: ""})
    const [inputState, setInputState] = useState('type')
    const [isTabVisible, setIsTabVisible] = useState(true)
    const [gameSave, setGameSave] = useState(loadSave())

    function randomKey() {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    }

    function getSpeakerData() {
        return getJurorData(logData.log?.[logData.log.length-1]?.speaker)
    }

    function buildTextAll() {
        setLogData(prevLogData => ({
            log: prevLogData.log.map((logEntry, i) => {
                if (i === prevLogData.log.length-1) {
                    const ret = {
                        ...logEntry,
                        text: logEntry.text + prevLogData.queue,
                        key: randomKey(),
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
                        key: randomKey(),
                    }
                    return ret
                }
                return logEntry
            }),
            queue: prevLogData.queue.substring(1),
        }))
    }

    function addLogEntry(logEntry) {
        setLogData(prevLogData => ({
            queue: logEntry.text,
            log: [
                ...prevLogData.log,
                {
                    ...logEntry,
                    text: "",
                    key: randomKey(),
                },
            ]
        }));
    }

    function addLogEntryInstant(logEntry) {
        setLogData(prevLogData => ({
            queue: "",
            log: [
                ...prevLogData.log,
                {
                    ...logEntry,
                    key: randomKey(),
                },
            ]
        }));
    }

    function executeConfirm(input) {
        if (inputState === 'type') {
            setInputState('read')

            const commandResult = parseCommand(input, gameSave)
            writeSaveData(commandResult.saveData)
            
            addLogEntryInstant({speaker: 'you', text: input})
            let logEntries = commandResult.logEntries || []
            if (commandResult.logEntry) {
                logEntries.unshift(commandResult.logEntry)
            }
            addLogEntry(logEntries[0])
        }
        else if (inputState === 'read') {
            setInputState('type')
            buildTextAll()
        }
    }

    function writeSaveData(saveData) {
        setGameSave(prevGameSave => {
            const ret = {
                ...prevGameSave,
                saveData
            }

            writeSave(ret)

            return ret
        });
    }

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
                logData={logData.log}
            />
            <Console
                inputState={inputState}
                onConfirm={executeConfirm}
            />
            <TabMonitor onChangeVisibility={setIsTabVisible}/>
        </>
    );
}

export default App;
