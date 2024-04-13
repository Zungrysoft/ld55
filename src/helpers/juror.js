import systemData from '../data/jurors/system.json';
import errorData from '../data/jurors/error.json';
import youData from '../data/jurors/you.json';
import cliveData from '../data/jurors/clive.json';

export function getJurorData(juror) {
    if (juror === 'error') {return errorData}
    if (juror === 'you') {return youData}
    if (juror === 'clive') {return cliveData}

    return systemData
}