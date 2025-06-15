"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const minimist = require("minimist");
const runner = require("./runner");
const convert = require("./convert");
const common_1 = require("./common");
const messages_1 = require("./messages");
async function run() {
    try {
        const argv = minimist(process.argv.slice(2));
        const runOptions = (0, common_1.initRunOptions)(argv['report']);
        const theRunner = new runner.SarifParserRunner();
        const convertReport = new convert.convertReport();
        const result = await convertReport.convertReportsWithJava(runOptions.WORKSPACE, [runOptions.REPORT]);
        const convertedReports = result.convertedCoberturaReportPaths;
        if (convertedReports) {
            await theRunner.sarifToBitBucket(runOptions, convertedReports[0]);
        }
    }
    catch (error) {
        console.error(messages_1.messages.run_failed);
        if (error instanceof Error) {
            console.info(error.message);
            console.error(error);
        }
    }
}
run();
//# sourceMappingURL=main.js.map