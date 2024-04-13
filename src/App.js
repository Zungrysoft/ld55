import React,{useEffect, useState} from 'react';
import './App.css';

import ChatLog from './components/ChatLog.js';
import Console from './components/Console.js';
import TabMonitor from './components/TabMonitor.js';
import { getJurorData } from './helpers/juror.js';
import { playVoice } from './helpers/voice.js';
import { parseCommand } from './helpers/command.js';
import defaultSaveData from './data/save.json';

const CHAT_SPEED = 10
const CHAT_SOUND_RATE = 2

function logDataToInputState(logData) {
    if (logData.queue.length === 0) {
        return 'send'
    }
    if (logData.queue[0].text.length === 0) {
        if (logData.queue.length <= 1) {
            return 'send'
        }
        return 'next'
    }
    return 'skip'
}

function loadSave() {
    try {
        let ret = JSON.parse(localStorage.getItem("save"))
        if (!ret) {
            ret = defaultSaveData
        }
        return ret
    }
    catch (e) {
        return defaultSaveData
    }
}

function App() {
    const [logData, setLogData] = useState({log: [], queue: []})
    const [isTabVisible, setIsTabVisible] = useState(true)
    const [gameSave, setGameSave] = useState(loadSave())

    function randomKey() {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    }

    function getSpeakerData() {
        return getJurorData(logData.queue?.[0]?.speaker)
    }

    function processNewLogEntry(entry) {
        const speakerName = getJurorData(entry.speaker).properties.name
        return {
            ...entry,
            text: "[" + speakerName + "]: " + entry.text,
            key: randomKey()
        }
    }

    function addToLog(logEntries) {
        setLogData(prevLogData => ({
            log: [...prevLogData.log, ...logEntries.map(entry => processNewLogEntry(entry))],
            queue: prevLogData.queue,
        }));
    }

    function addToQueue(logEntries) {
        setLogData(prevLogData => ({
            log: prevLogData.log,
            queue: [...prevLogData.queue, ...logEntries.map(entry => processNewLogEntry(entry))],
        }));
    }

    function advanceQueue() {
        if (logData.queue.length % CHAT_SOUND_RATE === 1) {
            if (isTabVisible) {
                playVoice(getSpeakerData().properties.voice)
            }
        }

        setLogData(prevLogData => {
            // New log entry
            if (prevLogData.log.length === 0 || prevLogData.log[prevLogData.log.length-1].key !== prevLogData.queue[0].key) {
                return {
                    log: [
                        ...prevLogData.log,
                        {
                            ...prevLogData.queue[0],
                            text: "",
                        }
                    ],
                    queue: prevLogData.queue,
                }
            }

            // Append to existing log entry
            return {
                log: prevLogData.log.map((logEntry, i) => {
                    if (i === prevLogData.log.length-1) {
                        const ret = {
                            ...logEntry,
                            text: logEntry.text + prevLogData.queue[0].text[0],
                        }
                        return ret
                    }
                    return logEntry
                }),
                queue: prevLogData.queue.map((queueEntry, i) => {
                    if (i === 0) {
                        return {
                            ...queueEntry,
                            text: queueEntry.text.substring(1)
                        }
                    }
                    return queueEntry
                }),
            }
        })
    }

    function skipQueue() {
        setLogData(prevLogData => ({
            log: prevLogData.log.map((logEntry, i) => {
                if (i === prevLogData.log.length-1) {
                    const ret = {
                        ...logEntry,
                        text: logEntry.text + prevLogData.queue[0].text,
                    }
                    return ret
                }
                return logEntry
            }),
            queue: prevLogData.queue.map((queueEntry, i) => {
                if (i === 0) {
                    const ret = {
                        ...queueEntry,
                        text: "",
                    }
                    return ret
                }
                return queueEntry
            }),
        }))
    }

    function nextQueue() {
        setLogData(prevLogData => ({
            log: prevLogData.log,
            queue: prevLogData.queue.length > 0 && prevLogData.queue[0].text.length === 0 ? prevLogData.queue.slice(1) : prevLogData.queue
        }))
    }

    function executeConfirm(input) {
        const inputState = logDataToInputState(logData)
        if (inputState === 'send') {
            if (input.length > 0) {
                const commandResult = parseCommand(input, gameSave)
                
                // If this command edits save data, do that
                writeSaveData(commandResult.saveData)
                
                // addLogEntryInstant()
                let queuePush = commandResult.logEntries || []
                if (commandResult.logEntry) {
                    queuePush.unshift(commandResult.logEntry)
                }

                addToLog([{speaker: 'you', text: input}])
                nextQueue()
                addToQueue(queuePush)
            }
        }
        else if (inputState === 'next') {
            nextQueue()
        }
        else if (inputState === 'skip') {
            skipQueue()
        }
    }

    function writeSaveData(saveData) {
        setGameSave(prevGameSave => {
            let ret
            if (saveData === "WIPE") {
                ret = defaultSaveData
            }
            else {
                ret = {
                    ...prevGameSave,
                    ...saveData,
                }
            }
            localStorage.setItem("save", JSON.stringify(ret))

            return ret
        });
    }

    useEffect(() => {
        if (logData.queue.length > 0 && logData.queue[0].text.length > 0) {
            const speakerData = getSpeakerData()
            const speedMultiplier = speakerData.properties.textSpeedMultiplier
            setTimeout(advanceQueue, CHAT_SPEED / speedMultiplier)
        }
    }, [logData])

    return (
        <>
            <ChatLog
                logData={logData.log}
            />
            <Console
                inputState={logDataToInputState(logData)}
                onConfirm={executeConfirm}
            />
            <TabMonitor onChangeVisibility={setIsTabVisible}/>
        </>
    );
}

export default App;
