import { loadAppState } from './src/app/state';
import { toCompletedSets } from './src/app/state';
import { resetStaleCompletedCollections } from './src/app/progress';
const state = loadAppState();
const sets = toCompletedSets(state.completed);
const reset = resetStaleCompletedCollections(sets, [], new Date(), 4);
console.log('OK', Object.keys(reset).length);
