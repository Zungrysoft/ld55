import { getJurorData } from "./juror"

export function getVote(juror, conclusions) {
    if (juror === 'geoff') {return geoffVote(conclusions)}
    if (juror === 'eddie') {return eddieVote(conclusions)}

    return defaultVote(juror, conclusions)
}

function defaultVote(juror, conclusions) {
    // Attourney general
    if (gc('attourneyGeneral', conclusions) >= 100.0) {
        return {
            text: [],
            acquit: true
        }
    }

    let acquitMurderShotgun = gc('shotgun', conclusions) >= 3.0
    let acquitMurderCoworker = gc('coworker', conclusions) >= 3.0
    let acquitMurderInheritance = gc('inheritance', conclusions) >= 3.0
    let acquitMurderMotivePlusOpportunity = acquitMurderCoworker || acquitMurderInheritance

    let acquitAssaultNullification = gc('nullification', conclusions) >= 5.0
    let acquitAssaultEvidence = gc('officer', conclusions) >= 3.0

    const voteJustifications = getJurorData(juror).voteJustifications

    // Acquit of murder
    if (acquitMurderShotgun && acquitMurderMotivePlusOpportunity) {
        // Acquit
        if (acquitAssaultEvidence || (acquitAssaultNullification && voteJustifications?.willDoJuryNullification)) {
            // Acquit inheritance
            if (!acquitMurderCoworker && voteJustifications?.acquitInheritance) {
                return {
                    text: voteJustifications?.acquitInheritance || [],
                    acquit: true
                }
            }

            // Acquit coworker
            if (!acquitMurderInheritance && voteJustifications?.acquitCoworker) {
                return {
                    text: voteJustifications?.acquitCoworker || [],
                    acquit: true
                }
            }

            // Full acquittal
            return {
                text: voteJustifications?.acquitEntirely || [],
                acquit: true
            }
        }

        // Charge with assault
        return {
            text: voteJustifications?.chargeWithAssault || [],
            acquit: false
        }
    }

    // Completely guilty
    if (!acquitMurderShotgun && !acquitMurderMotivePlusOpportunity) {
        return {
            text: voteJustifications?.completelyGuilty || [],
            acquit: false
        }
    }

    // Motive + Opportunity
    if (!acquitMurderMotivePlusOpportunity) {
        return {
            text: voteJustifications?.guiltyMotivePlusOpportunity || [],
            acquit: false
        }
    }

    // Shotgun
    return {
        text: voteJustifications?.guiltyShotgun || [],
        acquit: false
    }
}

function eddieVote(conclusions) {
    // Attourney general
    if (gc('attourneyGeneral', conclusions) >= 100.0) {
        return {
            text: [],
            acquit: true
        }
    }

    let acquitMurderShotgun = gc('shotgun', conclusions) >= 3.0
    let acquitMurderMotivePlusOpportunity = (gc('coworker', conclusions) >= 3.0) || (gc('inheritance', conclusions) >= 3.0)

    let acquitAssaultNullification = gc('nullification', conclusions) >= 5.0
    let acquitAssaultEvidence = gc('officer', conclusions) >= 3.0

    // Acquit of murder
    if (acquitMurderShotgun && acquitMurderMotivePlusOpportunity) {
        // Acquit entirely
        if (acquitAssaultNullification || acquitAssaultEvidence) {
            let retText = ["I just don't see it. All of the facts and reasons have holes in them. I don't know who killed that lady, but I don't think it's him."]

            if (acquitAssaultEvidence) {
                retText.push("And it's clear he didn't assault that lying police officer either.")
            }
            else {
                retText.push("As for that assault charge, I'm just not gonna charge him. This jury nullification thing is real swell!")
            }

            return {
                text: retText,
                acquit: true
            }
        }

        // Charge with assault
        return {
            text: ["I don't think he killed anybody, but we do unfortunately have to charge him with assault. I wish we didn't, but the law is the law, I suppose."],
            acquit: false
        }
    }

    // Completely guilty
    if (!acquitMurderShotgun && !acquitMurderMotivePlusOpportunity) {
        return {
            text: ["What can I say? The guy's guilty as they come. Some folks just can't be let out with the rest of the sinners."],
            acquit: false
        }
    }

    // Shotgun
    if (!acquitMurderShotgun) {
        return {
            text: ["It's pretty clear that he was the one who fired that gun. What else is there to say?"],
            acquit: false
        }
    }

    // Motive + Opportunity
    return {
        text: ["He had both motive and opportunity. I hate to say it, but the man's guilty."],
        acquit: false
    }
}

function geoffVote(conclusions) {
    // Attourney general
    if (gc('attourneyGeneral', conclusions) >= 100.0) {
        return {
            text: [],
            acquit: true
        }
    }

    let soulOfAmerica = gc('defendant', conclusions) >= 10.0

    if (soulOfAmerica) {
        return {
            text: ["I don't really know whether or not the kid is guilty, but I no longer feel equal to the task of sending him to jail."],
            acquit: true
        }
    }

    return {
        text: ["I don't care what all these loons say. The kid is guilty! I know he's guilty!"],
        acquit: false
    }
}

function gc(conclusionName, conclusions) {
    return conclusions[conclusionName] || 0
}