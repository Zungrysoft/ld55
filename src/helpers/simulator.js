import { getJurorData } from "./juror"

export function runSimulation(jurors) {
    // Sort jurors
    jurors = jurors.sort((a, b) => getJurorData(a).properties.number > getJurorData(b).properties.number)
    
    let log = []
    let claims = ["start"]

    // Deliberation
    

    // Final voting
    for (const juror of jurors) {
        log.push({
            speaker: juror,
            text: "Here!"
        })
    }

    // Return final result
    return log
}
