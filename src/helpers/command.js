import { getJurorData } from "./juror"
import commandData from '../data/commands.json';


export function parseCommand(input, saveData) {
    const argv = input.split(" ")

    // if (argv[0] === 'volume') {return commandVolume(argv, saveData)}
    if (argv[0] === 'help') {return commandHelp(argv, saveData)}

    return commandError(argv, saveData)
}

function commandVolume(argv, saveData) {

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
            ret += "\n"
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

function speakSnippet(juror, snippet, replacements) {
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