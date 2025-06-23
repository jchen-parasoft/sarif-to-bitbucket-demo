import * as fs from "fs";
import axios, { AxiosResponse } from "axios";
import {v4 as uuidv4} from 'uuid'
import {RunOptions} from "./options";

const BB_API_URL = 'https://api.bitbucket.org/2.0/repositories'

export class SarifParserRunner {
    async sarifToBitBucket(runOptions: RunOptions, convertedReport: string): Promise<void> {
        const sarifReportContent = fs.readFileSync(convertedReport, 'utf8');
        const sarifResult = JSON.parse(sarifReportContent);

        console.info(sarifResult)

        const scanType = this.getScanType(sarifResult);

        if (scanType['id'] === "c/c++test") {
            scanType['id'] = "c++test";
        }

        let vulnerabilities = this.getSarifResults(sarifResult);
        let details = `This repository contains ${scanType['count']} ${scanType['name']} vulnerabilities`;

        // Set the limit to show the first 100 vulnerabilities
        if (vulnerabilities.length > 100) {
            vulnerabilities = vulnerabilities.slice(0, 100);
            details = `${details} (first 100 vulnerabilities shown)`;
        }

        // Create Report module
        console.info("Create new report module...")
        await axios.put(
            `${BB_API_URL}/${runOptions.WORKSPACE}/${runOptions.REPO}/commit/${runOptions.COMMIT}/reports/${scanType['id']}`,
            {
                title: scanType['title'],
                details: details,
                report_type: "SECURITY",
                reporter: runOptions.BB_USER,
                result: "PASSED"
            },
            {
                auth: {
                    username: runOptions.BB_USER,
                    password: runOptions.BB_APP_PASSWORD
                }
            }
        );

        // Upload Annotations (Vulnerabilities)
        console.info("Upload vulnerabilities...")
        await axios.post(
            `${BB_API_URL}/${runOptions.WORKSPACE}/${runOptions.REPO}/commit/${runOptions.COMMIT}/reports/${scanType['id']}/annotations`,
            vulnerabilities,
            {
                auth: {
                    username: runOptions.BB_USER,
                    password: runOptions.BB_APP_PASSWORD
                }
            }
        );
    }

     private getScanType(sarif) {
        const scanName = sarif['runs'][0]['tool']['driver']['name'];
        return {
            id: scanName.replace(/\s+/g, "").toLowerCase(),
            title: scanName,
            name: scanName,
            count: sarif['runs'][0]['results'].length
        }
    }

    private getSarifResults(sarif) {
        const severityMap = {
            'note': 'LOW',
            'warning': 'MEDIUM',
            'error': 'HIGH'
        }

        const rulesMap = this.rulesAsMap(sarif['runs'][0]['tool']['driver']['rules']);

        return sarif['runs'][0]['results']
            .map(result => {
                return {
                    external_id: uuidv4(),
                    annotation_type: "VULNERABILITY",
                    severity: severityMap[result['level']],
                    path: this.getPath(result),
                    line: this.getLine(result),
                    summary: this.getSummary(result, rulesMap),
                    details: result['message']['text']
                }
            });
    }

    private rulesAsMap(sarifRules) {
        return sarifRules.reduce((map, rule) =>  ({ ...map, [rule['id']]: rule}), {});
    }

    private getPath(sarifResult) {
        return sarifResult['locations'][0]['physicalLocation']['artifactLocation']['uri'];
    }

    private getLine(sarifResult) {
        const region = sarifResult['locations'][0]['physicalLocation']['region'];
        if (region['endLine'] != null) {
            return region['endLine'];
        }

        return region['startLine'];
    }

    private getSummary(sarifResult, rulesMap) {
        const ruleId = sarifResult['ruleId'];
        const rule = rulesMap[ruleId];

        if (rule['fullDescription'] != null) {
            return rule['fullDescription']['text'];
        }

        if (rule['shortDescription'] != null) {
            return rule['shortDescription']['text'];
        }
    }
}