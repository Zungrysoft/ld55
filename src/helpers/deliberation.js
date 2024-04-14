import { getJurorData } from "./juror"

const CLAIM_STACK_SIZE = 10
const CLAIM_AGE_LIMIT = 10
const DOUBLE_SPEAK_SCORE_MULTIPLIER = 0.4

export function runDeliberation(jurors) {
    // Sort jurors
    jurors = jurors.sort((a, b) => getJurorData(a).properties.number > getJurorData(b).properties.number)
    
    let log = []
    let claims = [{name: 'start', speaker: 'system', age: 0}]
    let allClaims = new Set()
    let answeredClaims = []
    let responseNumber = 0
    let previousSpeaker = null
    let jurorAnger = {}

    // Deliberation
    while (claims.length > 0) {
        // Limit size of claim stack. Oldest claims are removed first.
        // This allows the jurors to forget certain claims if they get distracted by others
        while (claims.length > CLAIM_STACK_SIZE) {
            claims.shift()
        }

        // Advance age of all entries and remove claims that are too old
        for (let i = 0; i < claims.length; i ++) {
            claims[i].age ++
            if (claims[i].age > CLAIM_AGE_LIMIT) {
                claims.splice(i, 1)
            }
        }

        // Go through all possible responses to claims and pick the best one
        let bestResponse = null
        let bestResponseScore = 0
        let bestResponseSpeaker = null
        let bestResponseClaim = null
        for (let i = 0; i < claims.length; i ++) {
            const claim = claims[i]

            // Iterate over jurors
            for (const juror of jurors) {
                const response = getResponseToClaim(juror, claim, allClaims)
                if (response && response.score) {
                    let score = response.score
                    
                    // Make jurors less likely to answer older claims
                    score /= claim.age
                    
                    // Make jurors less likely to speak twice in a row
                    if (juror === previousSpeaker) {
                        score *= DOUBLE_SPEAK_SCORE_MULTIPLIER
                    }

                    if (score > bestResponseScore) {
                        bestResponseScore = score
                        bestResponse = response
                        bestResponseSpeaker = juror
                        bestResponseClaim = claim.name
                    }
                }
            }
        }

        // If no responses were found, see if there is a default response to one of these claims.
        // Default responses should only be used if nobody has a specific response to a claim.
        if (!bestResponse) {
            for (let i = 0; i < claims.length; i ++) {
                const claim = claims[i]

                // Never use a default response if this claim has been answered already
                if (answeredClaims.includes(claim.name)) {
                    continue
                }
    
                // Iterate over jurors
                const response = getResponseToClaim('default', claim, allClaims)
                if (response && response.score) {
                    let score = response.score
                    
                    // Make jurors less likely to answer older claims
                    score /= claim.age

                    if (score > bestResponseScore) {
                        // Pick an arbitrary juror to say this line
                        const possibleJurors = jurors.filter(e => e !== claim.speaker)
                        const juror = possibleJurors[responseNumber % possibleJurors.length]

                        bestResponseScore = score
                        bestResponse = response
                        bestResponseSpeaker = juror
                        bestResponseClaim = claim.name
                    }
                }
            }
        }

        // Execute the best response
        if (bestResponse) {
            // Add response text to log
            log.push(...bestResponse.text.map(e => ({
                speaker: bestResponseSpeaker,
                text: e
            })))

            // Add new claims made by this response
            claims.push(...bestResponse.claims.map(e => ({name: e, age: 0, speaker: bestResponseSpeaker})))
            allClaims = new Set([...allClaims, ...bestResponse.claims])
            answeredClaims.push(bestResponseClaim)

            // Set previous speaker
            previousSpeaker = bestResponseSpeaker

            // Add agreement message
            if (bestResponse.receivesAgreement) {
                // Pick an arbitrary juror to say this line
                const possibleJurors = jurors.filter(e => e !== bestResponseSpeaker)
                const juror = possibleJurors[responseNumber % possibleJurors.length]

                log.push({
                    speaker: juror,
                    text: responseNumber % 3 === 0 ? "That's true." : "Good point."
                })
            }

            // Count number of responses
            responseNumber ++
        }
        // If the jurors have nothing to say, end the deliberation
        else {
            break
        }
    }

    // Final voting
    let acquittalVotes = 0
    for (const juror of jurors) {
        log.push({
            speaker: juror,
            text: "Voting..."
        })
    }

    // Result
    if (acquittalVotes >= jurors.length) {
        log.push({
            speaker: 'system',
            text: "The jury has unanimously voted for acquittal! Congratulations!"
        })
    }
    else if (acquittalVotes >= 3) {
        log.push({
            speaker: 'system',
            text: `The vote is ${acquittalVotes} to ${jurors.length-acquittalVotes} in favor of acquittal! Congratulations!.`
        })
    }
    else if (acquittalVotes === 0) {
        log.push({
            speaker: 'system',
            text: "The jury has unanimously voted for conviction."
        })
    }
    else {
        log.push({
            speaker: 'system',
            text: `Only ${acquittalVotes} jurors voted for acquittal. Three are needed.`
        })
    }

    // Return final result
    return log
}

function getResponseToClaim(juror, claim, allClaims) {
    // A juror can't respond to their own claim
    if (juror === claim.speaker) {
        return null
    }

    // Loop over possible responses
    let possibleResponses = getJurorData(juror)?.responses?.[claim.name]
    if (possibleResponses) {
        for (const response of possibleResponses) {
            // Responses can't bring up a claim that was already brought up
            if (hasBeenBroughtUp(response, allClaims)) {
                continue
            }

            // If a response is marked as "immediate", the claim it response to must have been the last thing said
            if (response.requirements?.immediate && claim.age > 1) {
                continue
            }

            return response
        }
    }

    // No valid responses
    return null
}

function hasBeenBroughtUp(response, allClaims) {
    for (const claim of response.claims) {
        if (allClaims.has(claim)) {
            return true
        }
    }
    return false
}
