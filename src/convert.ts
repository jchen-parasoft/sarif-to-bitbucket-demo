import * as cp from 'child_process';
import * as pt from 'path';
import {messages, messagesFormatter} from "./messages";

export interface RunDetails {
    exitCode: number;
    convertedCoberturaReportPaths?: string[];
}
export class convertReport {
    async convertReportsWithJava(workspace: string, sourcePaths: string[]): Promise<RunDetails> {
        const javaPath = process.env.JAVA_HOME
        const jarPath = pt.join(__dirname, "SaxonHE12-2J/saxon-he-12.2.jar");
        const xslPath = pt.join(__dirname, "sarif.xsl");
        const sarifReports: string[] = [];

        for (const sourcePath of sourcePaths) {
            console.info(messagesFormatter.format(messages.converting_static_analysis_report_to_sarif, sourcePath));
            const outPath = sourcePath.substring(0, sourcePath.toLocaleLowerCase().lastIndexOf('.xml')) + '.sarif';

            const commandLine = `"${javaPath}/bin/java" -jar "${jarPath}" -s:"${sourcePath}" -xsl:"${xslPath}" -o:"${outPath}" -versionmsg:off pipelineBuildWorkingDirectory="${workspace}"`;
            console.info(commandLine);
            const result = await new Promise<RunDetails>((resolve, reject) => {
                const process = cp.spawn(`${commandLine}`, {shell: true, windowsHide: true });
                this.handleProcess(process, resolve, reject);
            });

            if (result.exitCode != 0) {
                return { exitCode: result.exitCode };
            }
            sarifReports.push(outPath);
            console.info(messagesFormatter.format(messages.converted_sarif_report, outPath));
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
