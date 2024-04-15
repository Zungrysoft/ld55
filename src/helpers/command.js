import { getJurorData, getAllJurors } from "./juror"
import commandData from '../data/commands.json';
import topicData from '../data/topics.json';
import documentData from '../data/documents.json';
import { runDeliberation } from "./deliberation.js";
import { getCombinations, getSubsets } from "./helpers.js";

export function parseCommand(input, saveData) {
    // Parse input into args
    const argv = input.toLowerCase().split(" ").filter(e => e.length > 0)

    if (argv[0] === 'ls') {return commandUnix(argv.slice(1), saveData)}
    if (argv[0] === 'pwd') {return commandUnix(argv.slice(1), saveData)}

    if (argv[0].length < 3) {
        return {
            logEntries: speakText('system', "You must provide at least three letters when entering a command."),
        }
    }
    
    if ('debug' === argv[0]) {return commandDebug(argv.slice(1), saveData)}
    if ('spoiler' === argv[0]) {return commandAnalyze(argv.slice(1), saveData)}
    if ('help'.includes(argv[0])) {return commandHelp(argv.slice(1), saveData)}
    if ('restart'.includes(argv[0])) {return commandRestart(argv.slice(1), saveData)}
    if ('interview'.includes(argv[0])) {return commandInterview(argv.slice(1), saveData)}
    if ('document'.includes(argv[0])) {return commandDocument(argv.slice(1), saveData)}
    if ('select'.includes(argv[0])) {return commandSelect(argv.slice(1), saveData)}

    return commandError(argv, saveData)
}

function commandDebug(argv, saveData) {
    // return {
    //     logEntries: speakText('system', localStorage.getItem("save")),
    //     saveData: {},
    // }
    return {
        logEntries: speakText('system', JSON.stringify(saveData)),
    }
}

function commandAnalyze(argv, saveData) {
    const jurorList = Object.keys(getAllJurors())
    const combinations = getCombinations(jurorList).filter(c => c.length === 4)

    let acquitCount = 0
    let acquitCombinations = []
    for (const combination of combinations) {
        const result = runDeliberation(combination)
        if (result.acquit) {
            acquitCount ++
            acquitCombinations.push(combination)
        }
    }

    let ret = "There are " + acquitCount + " winning combinations:"

    for (const combination of acquitCombinations) {
        ret += "\n\t" + combination.toString().replaceAll(",", " ")
    }

    ret += "\nJuror counts:"

    for (const juror of jurorList) {
        const count = acquitCombinations.filter(c => c.includes(juror)).length
        ret += "\n\t" + getJurorData(juror).properties.name + ": " + count
    }

    return {
        logEntries: speakText('system', ret),
    }
}

function commandUnix(argv, saveData) {
    return {
        logEntries: speakText('system', "This is not a Unix operating system, buddy."),
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
        logEntries: speakText('system', `Unknown topic. Type \"interview ${juror}\" to see the list of topics.`),
    }
}

function interview(juror, topic) {
    const jurorData = getJurorData(juror)

    if (jurorData.topics) {
        if (jurorData.topics[topic]) {
            return {
                logEntries: jurorData.topics[topic].response.map(e => ({
                    text: e,
                    speaker: juror,
                })),
                newTopics: jurorData.topics[topic].relatedTopics
            }
        }
        if (jurorData.topics.default) {
            return {
                logEntries: jurorData.topics.default.response.map(e => ({
                    text: e,
                    speaker: juror,
                })),
                newTopics: jurorData.topics.default.relatedTopics
            }
        }
    }
    return {
        logEntries: speakText(juror, "I don't know."),
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
    }
}

function commandDocument(argv, saveData) {
    if (argv.length === 0) {
        return listDocuments(saveData)
    }

    if (argv[0].length < 3) {
        return errorTooShort()
    }

    for (const doc in documentData) {
        const document = documentData[doc]
        if (document.name.toLowerCase().replaceAll(" ", "").includes(argv[0])) {
            return {
                logEntries: document.text.map(e => ({
                    text: e,
                    speaker: 'system',
                })),
            }
        }
    }
    
    // No juror found
    return {
        logEntries: speakText('system', "No juror by that name found. Type \"interview\" to see the list of jurors."),
    }
}

function listDocuments(saveData) {
    let ret = "Type \"document [name]\" to read that document:"
    for (const entry in documentData) {
        ret += "\n\t"
        ret += documentData[entry].name
    }

    return {
        logEntry: {
            text: ret,
            speaker: 'system',
        },
    }
}

function commandRestart(argv, saveData) {
    if (argv[0] === "force") {
        return {
            logEntries: speakText('system', "Save data has been wiped."),
            wipeSave: true,
        }
    }
    else {
        return {
            logEntries: speakText('system', "Type \"restart force\" to wipe save data."),
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
        if (saveData.commands.includes(command)) {
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
    }
}

function commandSelect(argv, saveData) {
    // Help with command
    if (argv.length === 0) {
        return {
            logEntries: speakText('system', "Select four jurors: \"select [juror 1] [juror 2] [juror 3] [juror 4]\""),
        }
    }

    // Wrong number of jurors
    if (argv.length !== 4) {
        return {
            logEntries: speakText('system', "You must select exactly four jurors."),
        }
    }

    // Validate juror names
    let jurors = []
    for (const jurorArg of argv) {
        let juror = getJurorFromName(jurorArg)

        // Unknown juror
        if (!juror) {
            return {
                logEntries: speakText('system', "Invalid juror: " + jurorArg),
            }
        }

        // Duplicate juror
        if (jurors.includes(juror)) {
            return {
                logEntries: speakText('system', "Duplicate juror: " + juror),
            }
        }

        // Valid juror
        jurors.push(juror)
    }

    // Perform the deliberation
    return {
        logEntries: runDeliberation(jurors).log,
    }
}

function getJurorFromName(jurorArg) {
    const allJurors = getAllJurors()
    for (const juror in allJurors) {
        const jurorName = allJurors[juror].properties.name
        if (jurorName.toLowerCase().includes(jurorArg.toLowerCase())) {
            return juror
        }
    }
    return null
}

function commandError(argv, saveData) {
    return {
        logEntries: speakText('system', `Unknown command \"${argv[0]}\". Enter \"help\" for a list of commands.`),
    }
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
    }
}