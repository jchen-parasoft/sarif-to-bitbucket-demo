import {RunOptions} from "./options";

export function initRunOptions(reportPath: string): RunOptions {
    const BB_USER = process.env.BB_USER;
    const BB_APP_PASSWORD= process.env.BB_APP_PASSWORD;
    const REPO= process.env.BITBUCKET_REPO_SLUG;
    const COMMIT= process.env.BITBUCKET_COMMIT;
    const WORKSPACE= process.env.BITBUCKET_WORKSPACE;

    if (BB_USER == undefined) {
        throw Error('Error: BitBucket username is undefined')
    }

    if (BB_APP_PASSWORD == undefined) {
        throw Error('Error: BitBucket App password is undefined')
    }

    if (REPO == undefined) {
        throw Error('Error: BitBucket repository is undefined')
    }

    if (COMMIT == undefined) {
        throw Error('Error: BitBucket commit is undefined')
    }

    if (WORKSPACE == undefined) {
        throw Error('Error: BitBucket workspace is undefined')
    }

    if (reportPath == null) {
        throw Error('Error: specify report')
    }

    return {
        BB_USER: BB_USER,
        BB_APP_PASSWORD: BB_APP_PASSWORD,
        REPO: REPO,
        COMMIT: COMMIT,
        WORKSPACE: WORKSPACE,
        REPORT: reportPath
    }
}