"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsAreValid = paramsAreValid;
function paramsAreValid(runOptions) {
    if (runOptions.BB_USER == null) {
        console.log('Error: specify user');
        return false;
    }
    if (runOptions.BB_APP_PASSWORD == null) {
        console.log('Error: specify password');
        return false;
    }
    if (runOptions.REPO == null) {
        console.log('Error: specify repo');
        return false;
    }
    if (runOptions.COMMIT == null) {
        console.log('Error: specify commit');
        return false;
    }
    if (runOptions.WORKSPACE == null) {
        console.log('Error: specify workspace');
        return false;
    }
    if (runOptions.REPORT == null) {
        console.log('Error: specify report');
        return false;
    }
    return true;
}
//# sourceMappingURL=common.js.map