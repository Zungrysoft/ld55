import { getJurorData } from "./juror"

const CLAIM_STACK_SIZE = 3
const DOUBLE_SPEAK_SCORE_MULTIPLIER = 0.4

export function runDeliberation(jurors) {
    // Sort jurors
    jurors = jurors.sort((a, b) => getJurorData(a).properties.number > getJurorData(b).properties.number)
    
    let log = []
    let claims = [{name: 'start', speaker: 'system', age: 0}]
    let resolvedClaims = []
    let responseNumber = 0
    let previousSpeaker = null
    let jurorAnger = {}

    // Deliberation
    while (claims.length > 0) {
        // Limit size of claim stack. Oldest claims are removed first.
        // This allows the jurors to forget certain claims they get distracted by others
        while (claims.length > CLAIM_STACK_SIZE) {
            claims.shift()
        }

        // Advance age of all entries
        for (let i = 0; i < claims.length; i ++) {
            claims[i].age ++
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
                const response = getResponseToClaim(juror, claim, resolvedClaims)
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

        // Execute the best response
        if (bestResponse) {
            // Add response text to log
            log.push(...bestResponse.text.map(e => ({
                speaker: bestResponseSpeaker,
                text: e
            })))

            // Add new claims made by this response
            claims.push(...bestResponse.claims.map(e => ({name: e, age: 0, speaker: bestResponseSpeaker})))

            // Remove resolved claim
            for (let i = claims.length-1; i >= 0; i --) {
                if (claims[i].name === bestResponseClaim) {
                    resolvedClaims.push(claims[i].name)
                    claims.splice(i, 1)
                }
            }

            // Set previous speaker
            previousSpeaker = bestResponseSpeaker

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

function getResponseToClaim(juror, claim, resolvedClaims) {
    // A juror can't respond to their own claim
    if (juror === claim.speaker) {
        return null
    }

    // Loop over possible responses
    let possibleResponses = getJurorData(juror)?.responses?.[claim.name]
    if (possibleResponses) {
        for (const response of possibleResponses) {
            // Responses can't bring up an already resolved claim
            if (isResolved(response, resolvedClaims)) {
                continue
            }

            return response
        }
    }

    // No valid responses
    return null
}

function isResolved(response, resolvedClaims) {
    for (const claim of response.claims) {
        if (resolvedClaims.includes(claim)) {
            return true
        }
    }
    return false
}
