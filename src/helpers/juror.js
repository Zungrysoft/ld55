import narratorData from '../data/jurors/narrator.json';
import cliveData from '../data/jurors/clive.json';

export function getJurorData(juror) {
    if (juror === 'clive') {return cliveData}

    return narratorData
}