
import * as minimist from "minimist";
import * as runner from "./runner";
import * as convert from "./convert"
import {paramsAreValid} from './common'
import {RunOptions} from "./options";
import {messages} from "./messages";

export async function run(): Promise<void> {
    try {
        const argv = minimist(process.argv.slice(2));
        const runOptions: RunOptions = {
             BB_USER: argv['username'],
             BB_APP_PASSWORD: argv['password'],
             REPO: argv['repo'],
             COMMIT: argv['commit'],
             WORKSPACE: argv['workspace'],
             REPORT: argv['report']
        };

        if (paramsAreValid(runOptions)) {
            const theRunner = new runner.SarifParserRunner();
            const convertReport = new convert.convertReport();
            const result = await convertReport.convertReportsWithJava(runOptions.WORKSPACE, [runOptions.REPORT]);
            const convertedReports = result.convertedCoberturaReportPaths;
            if(convertedReports) {
                await theRunner.sarifToBitBucket(runOptions, convertedReports[0]);
            }
        }
    } catch (error) {
        console.error(messages.run_failed);
        if (error instanceof Error) {
            console.info(error.message);
            console.error(error);
        }
    }
}

run();