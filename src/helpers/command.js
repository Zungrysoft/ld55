import { getJurorData, getAllJurors } from "./juror"
import commandData from '../data/commands.json';
import topicData from '../data/topics.json';

export function parseCommand(input, saveData) {
    const argv = input.toLowerCase().split(" ")
    
    if (argv[0] === 'debug') {return commandDebug(argv.slice(1), saveData)}
    if (argv[0] === 'help') {return commandHelp(argv.slice(1), saveData)}
    if (argv[0] === 'restart') {return commandRestart(argv.slice(1), saveData)}
    if (argv[0] === 'interview') {return commandInterview(argv.slice(1), saveData)}

    return commandError(argv, saveData)
}

function commandDebug(argv, saveData) {
    // return {
    //     logEntries: speakText('system', localStorage.getItem("save")),
    //     saveData: {},
    // }
    return {
        logEntries: speakText('system', JSON.stringify(saveData)),
        saveData: {aDebug: Math.random()},
    }
}

function commandInterview(argv, saveData) {
    if (argv.length === 0) {
        return listJurors()
    }

    if (argv[0].length < 3) {
        return errorTooShort()
    }

    const jurors = getAllJurors()
    for (const juror in jurors) {
        const jurorData = jurors[juror]
        const jurorName = jurorData.properties.name
        if (jurorName.toLowerCase().includes(argv[0])) {
            return commandInterviewTopic(juror, argv.slice(1), saveData)
        }
    }
    
    // No juror found
    return {
        logEntries: speakText('system', "No juror by that name found. Type \"interview\" to see the list of jurors."),
        saveData: {},
    }
}

function commandInterviewTopic(juror, argv, saveData) {
    if (argv.length === 0) {
        return listTopics(juror, saveData)
    }

    let fullString = []
    for (const a of argv) {
        fullString += a
    }
 
    if (fullString.length < 3) {
        return errorTooShort()
    }

    for (const topic in topicData) {
        const topicString = topicData[topic]
        if (topicString.toLowerCase().replaceAll(" ", "").replaceAll(".", "").replaceAll("'", "").includes(fullString)) {
            return interview(juror, topic)
        }
    }
    
    // No juror found
    return {
        logEntries: speakText('system', "Unknown topic. Type \"interview\" to see the list of jurors."),
        saveData: {},
    }
}

function interview(juror, topic) {
    const jurorData = getJurorData(juror)

    if (jurorData.topics) {
        if (jurorData.topics[topic]) {
            return {
                logEntries: jurorData.topics[topic].map(e => ({
                    text: e,
                    speaker: juror,
                })),
                saveData: {},
            }
        }
        if (jurorData.topics.default) {
            return {
                logEntries: jurorData.topics.default.map(e => ({
                    text: e,
                    speaker: juror,
                })),
                saveData: {},
            }
        }
    }
    return {
        logEntries: speakText(juror, "I don't know."),
        saveData: {},
    }
    
}

function listJurors() {
    let ret = ""
    const jurors = getAllJurors()
    ret += "Type \"interview [juror]\" to select your juror:"
    for (const entry in jurors) {
        ret += "\n\t"
        ret += jurors[entry].properties.name
    }

    return {
        logEntry: {
            text: ret,
            speaker: 'system',
        },
        saveData: {},
    }
}

function listTopics(juror, saveData) {
    const jurorName = getJurorData(juror).properties.name.toLowerCase()
    let ret = "Type \"interview " + jurorName + " [topic]\" to select your topic:"
    for (const entry in topicData) {
        if (saveData.topics.includes(entry)) {
            ret += "\n\t"
            ret += topicData[entry]
        }
    }

    return {
        logEntry: {
            text: ret,
            speaker: 'system',
        },
        saveData: {},
    }
}

function commandRestart(argv, saveData) {
    if (argv[0] === "force") {
        return {
            logEntries: speakSnippet('system', 'restartForce'),
            saveData: "WIPE",
        }
    }
    else {
        return {
            logEntries: speakSnippet('system', 'restart'),
            saveData: {},
        }
    }
}

function commandHelp(argv, saveData) {
    let ret = ""
    let longest = 0
    for (const command in commandData) {
        if (command.length > longest) {
            longest = command.length
        }
    }
    for (const command in commandData) {
        if (saveData.commandsUnlocked.includes(command)) {
            ret += "\n\t"
            ret += command
            ret += ":"
            const numSpaces = (longest - command.length) + 1
            for (let i = 0; i < numSpaces; i ++) {
                ret += " "
            }
            ret += commandData[command].description
        }
    }

    return {
        logEntry: {
            text: ret,
            speaker: 'system',
        },
        saveData: {},
    }
}

function commandError(argv, saveData) {
    return {
        logEntries: speakSnippet('system', 'commandError', [argv[0]]),
        saveData: {},
    }
}

function speakSnippet(juror, snippet, replacements=[]) {
    const jurorData = getJurorData(juror)
    const snippetText = jurorData?.textSnippets?.[snippet]
    if (snippetText) {
        const builtResponse = []
        for (let entry of snippetText) {
            while (entry.includes("{}")) {
                entry = entry.replace("{}", replacements.shift())
            }
            builtResponse.push({
                text: entry,
                speaker: juror,
            })
        }
        return builtResponse
    }

    return [{
        speaker: 'error',
        text: "Error: Invalid text snippet."
    }]
}

function speakText(juror, snippet) {
    return [{
        speaker: juror,
        text: snippet,
    }]
}

function errorTooShort() {
    return {
        logEntries: speakText('system', "You must provide at least three letters in a search."),
        saveData: {},
    }
}