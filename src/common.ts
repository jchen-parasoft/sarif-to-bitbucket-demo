import {RunOptions} from "./options";

export function paramsAreValid(runOptions: RunOptions): Boolean {
    if (runOptions.BB_USER == null) {
        console.log('Error: specify user')
        return false
    }

    if (runOptions.BB_APP_PASSWORD == null) {
        console.log('Error: specify password')
        return false
    }

    if (runOptions.REPO == null) {
        console.log('Error: specify repo')
        return false
    }

    if (runOptions.COMMIT == null) {
        console.log('Error: specify commit')
        return false
    }

    if (runOptions.WORKSPACE == null) {
        console.log('Error: specify workspace')
        return false
    }

    if (runOptions.REPORT == null) {
        console.log('Error: specify report')
        return false
    }

    return true
}