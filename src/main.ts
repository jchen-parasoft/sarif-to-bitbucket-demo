import * as minimist from "minimist";
import * as runner from "./runner";
import * as convert from "./convert"
import {initRunOptions} from './common'
import {RunOptions} from "./options";
import {messages} from "./messages";

export async function run(): Promise<void> {
    try {
        const argv = minimist(process.argv.slice(2));
        const runOptions: RunOptions = initRunOptions(argv['report']);

        const theRunner = new runner.SarifParserRunner();
        const convertReport = new convert.convertReport();
        const result = await convertReport.convertReportsWithJava([runOptions.REPORT]);
        const convertedReports = result.convertedCoberturaReportPaths;
        if(convertedReports) {
            await theRunner.sarifToBitBucket(runOptions, convertedReports[0]);
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