import * as cp from 'child_process';
import * as pt from 'path';
import {messages, messagesFormatter} from "./messages";

export interface RunDetails {
    exitCode: number;
    convertedCoberturaReportPaths?: string[];
}
export class convertReport {
    async convertReportsWithJava(sourcePaths: string[]): Promise<RunDetails> {
        const jarPath = pt.join(__dirname, "SaxonHE12-2J/saxon-he-12.2.jar");
        const xslPath = pt.join(__dirname, "sarif.xsl");
        const sarifReports: string[] = [];
        const workspace = pt.join(__dirname, '..', '..');

        for (const sourcePath of sourcePaths) {
            console.log(messagesFormatter.format(messages.converting_static_analysis_report_to_sarif, sourcePath));
            const outPath = sourcePath.substring(0, sourcePath.toLocaleLowerCase().lastIndexOf('.xml')) + '.sarif';

            const commandLine = `java -jar "${jarPath}" -s:"${sourcePath}" -xsl:"${xslPath}" -o:"${outPath}" -versionmsg:off pipelineBuildWorkingDirectory="${workspace}"`;
            console.log(commandLine);
            const result = await new Promise<RunDetails>((resolve, reject) => {
                const process = cp.spawn(`${commandLine}`, {shell: true, windowsHide: true });
                this.handleProcess(process, resolve, reject);
            });

            if (result.exitCode != 0) {
                return { exitCode: result.exitCode };
            }
            sarifReports.push(outPath);
            console.log(messagesFormatter.format(messages.converted_sarif_report, outPath));
        }

        return { exitCode: 0, convertedCoberturaReportPaths: sarifReports };
    }

    private handleProcess(process, resolve, reject) {
        process.stdout?.on('data', (data) => { console.info(`${data}`.replace(/\s+$/g, '')); });
        process.stderr?.on('data', (data) => { console.info(`${data}`.replace(/\s+$/g, '')); });
        process.on('close', (code) => {
            const result : RunDetails = {
                exitCode: (code != null) ? code : 150 // 150 = signal received
            };
            resolve(result);
        });
        process.on("error", (err) => { reject(err); });
    }
}
