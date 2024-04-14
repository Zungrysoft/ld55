import systemData from '../data/jurors/system.json';
import errorData from '../data/jurors/error.json';
import youData from '../data/jurors/you.json';
import defaultData from '../data/jurors/default.json';
import cliveData from '../data/jurors/clive.json';
import susanData from '../data/jurors/susan.json';
import geoffData from '../data/jurors/geoff.json';
import eddieData from '../data/jurors/eddie.json';
import lynnData from '../data/jurors/lynn.json';

export function getJurorData(juror) {
    if (juror === 'error') {return errorData}
    if (juror === 'you') {return youData}
    if (juror === 'default') {return defaultData}
    if (juror === 'clive') {return cliveData}
    if (juror === 'susan') {return susanData}
    if (juror === 'geoff') {return geoffData}
    if (juror === 'eddie') {return eddieData}
    if (juror === 'lynn') {return lynnData}

    return systemData
}

export function getAllJurors() {
    return {
        clive: cliveData,
        susan: susanData,
        geoff: geoffData,
        eddie: eddieData,
        lynn: lynnData,
    }
}