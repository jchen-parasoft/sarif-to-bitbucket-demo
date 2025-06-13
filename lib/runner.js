"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SarifParserRunner = void 0;
const fs = require("fs");
const axios_1 = require("axios");
const uuid_1 = require("uuid");
const BB_API_URL = 'https://api.bitbucket.org/2.0/repositories';
class SarifParserRunner {
    async sarifToBitBucket(runOptions, convertedReport) {
        const sarifReportContent = fs.readFileSync(convertedReport, 'utf8');
        const sarifResult = JSON.parse(sarifReportContent);
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
        // Delete Existing Report
        await axios_1.default.delete(`${BB_API_URL}/${runOptions.WORKSPACE}/${runOptions.REPO}/commit/${runOptions.COMMIT}/reports/${scanType['id']}`, {
            auth: {
                username: runOptions.BB_USER,
                password: runOptions.BB_APP_PASSWORD
            }
        });
        // Create Report module
        await axios_1.default.put(`${BB_API_URL}/${runOptions.WORKSPACE}/${runOptions.REPO}/commit/${runOptions.COMMIT}/reports/${scanType['id']}`, {
            title: scanType['title'],
            details: details,
            report_type: "SECURITY",
            reporter: "sarif-to-bitbucket-demo",
            result: "PASSED"
        }, {
            auth: {
                username: runOptions.BB_USER,
                password: runOptions.BB_APP_PASSWORD
            }
        });
        // Upload Annotations (Vulnerabilities)
        await axios_1.default.post(`${BB_API_URL}/${runOptions.WORKSPACE}/${runOptions.REPO}/commit/${runOptions.COMMIT}/reports/${scanType['id']}/annotations`, vulnerabilities, {
            auth: {
                username: runOptions.BB_USER,
                password: runOptions.BB_APP_PASSWORD
            }
        });
    }
    getScanType(sarif) {
        const scanName = sarif['runs'][0]['tool']['driver']['name'];
        return {
            id: scanName.replace(/\s+/g, "").toLowerCase(),
            title: scanName,
            name: scanName,
            count: sarif['runs'][0]['results'].length
        };
    }
    getSarifResults(sarif) {
        const severityMap = {
            'note': 'LOW',
            'warning': 'MEDIUM',
            'error': 'HIGH'
        };
        const rulesMap = this.rulesAsMap(sarif['runs'][0]['tool']['driver']['rules']);
        return sarif['runs'][0]['results']
            .map(result => {
            return {
                external_id: (0, uuid_1.v4)(),
                annotation_type: "VULNERABILITY",
                severity: severityMap[result['level']],
                path: this.getPath(result),
                line: this.getLine(result),
                summary: this.getSummary(result, rulesMap),
                details: result['message']['text']
            };
        });
    }
    rulesAsMap(sarifRules) {
        return sarifRules.reduce((map, rule) => ({ ...map, [rule['id']]: rule }), {});
    }
    getPath(sarifResult) {
        return sarifResult['locations'][0]['physicalLocation']['artifactLocation']['uri'];
    }
    getLine(sarifResult) {
        const region = sarifResult['locations'][0]['physicalLocation']['region'];
        if (region['endLine'] != null) {
            return region['endLine'];
        }
        return region['startLine'];
    }
    getSummary(sarifResult, rulesMap) {
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
exports.SarifParserRunner = SarifParserRunner;
//# sourceMappingURL=runner.js.map