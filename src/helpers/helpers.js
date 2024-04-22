export function getCombinations(arr) {
    // This function uses recursion to generate combinations
    function combine(tempArray, start) {
        // Adding the current combination to the result
        result.push([...tempArray]);

        // Generate further combinations by adding each remaining element to the current combination
        for (let i = start; i < arr.length; i++) {
            // Include the current element
            tempArray.push(arr[i]);
            // Recurse with the included element
            combine(tempArray, i + 1);
            // Remove the last element to explore the next candidate
            tempArray.pop();
        }
    }

    const result = [];
    combine([], 0);
    return result;
}

export function isFirefox() {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
        return navigator.userAgent.indexOf("Firefox") > -1
    }
    return false;
}
