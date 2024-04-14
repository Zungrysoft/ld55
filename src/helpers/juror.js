import systemData from '../data/jurors/system.json';
import errorData from '../data/jurors/error.json';
import youData from '../data/jurors/you.json';
import cliveData from '../data/jurors/clive.json';
import susanData from '../data/jurors/susan.json';
import geoffData from '../data/jurors/geoff.json';
import eddieData from '../data/jurors/eddie.json';

export function getJurorData(juror) {
    if (juror === 'error') {return errorData}
    if (juror === 'you') {return youData}
    if (juror === 'clive') {return cliveData}
    if (juror === 'susan') {return susanData}
    if (juror === 'geoff') {return geoffData}
    if (juror === 'eddie') {return eddieData}

    return systemData
}

export function getAllJurors() {
    return {
        clive: cliveData,
        susan: susanData,
        geoff: geoffData,
        eddie: eddieData,
    }
}