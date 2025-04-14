#!/usr/bin/env node

import axios from 'axios'
import minimist from 'minimist'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const BB_API_URL = 'https://api.bitbucket.org/2.0/repositories'

const argv = minimist(process.argv.slice(2));

const BB_USER = argv['user']
const BB_APP_PASSWORD = argv['password']
const REPO = argv['repo']
const COMMIT = argv['commit']
const WORKSPACE = argv['workspace']
const REPORT = argv['report']

const paramsAreValid = () => {
    if (BB_USER == null) {
        console.log('Error: specify user')
        return false
    }

    if (BB_APP_PASSWORD == null) {
        console.log('Error: specify password')
        return false
    }

    if (REPO == null) {
        console.log('Error: specify repo')
        return false
    }

    if (COMMIT == null) {
        console.log('Error: specify commit')
        return false
    }

    if (WORKSPACE == null) {
        console.log('Error: specify workspace')
        return false
    }

    if (REPORT == null) {
        console.log('Error: specify report')
        return false
    }

    return true
}

const rulesAsMap = (sarifRules) => {
    return sarifRules.reduce((map, rule) =>  ({ ...map, [rule['id']]: rule}), {})
}

const getPath = (sarifResult) => {
    return sarifResult['locations'][0]['physicalLocation']['artifactLocation']['uri']
}

const getLine = (sarifResult) => {
    const region = sarifResult['locations'][0]['physicalLocation']['region']
    if (region['endLine'] != null) {
        return region['endLine']
    }

    return region['startLine']
}

const getSummary = (sarifResult, rulesMap) => {
    const ruleId = sarifResult['ruleId']
    const rule = rulesMap[ruleId]

    if (rule['fullDescription'] != null) {
        return rule['fullDescription']['text']
    }

    if (rule['shortDescription'] != null) {
        return rule['shortDescription']['text']
    }
}

const mapSarif = (sarif) => {
    const severityMap = {
        'note': 'LOW',
        'warning': 'MEDIUM',
        'error': 'HIGH'
    }

    const rulesMap = rulesAsMap(sarif['runs'][0]['tool']['driver']['rules'])

    return sarif['runs'][0]['results']
        .map(result => {
            return {
                external_id: uuidv4(),
                annotation_type: "VULNERABILITY",
                severity: severityMap[result['level']],
                path: getPath(result),
                line: getLine(result),
                summary: getSummary(result, rulesMap),
                details: result['message']['text']
            }
        })
}

const getScanType = (sarif) => {
    const scanName = sarif['runs'][0]['tool']['driver']['name']
    return {
        id: scanName.replace(/\s+/g, "").toLowerCase(),
        title: scanName,
        name: scanName,
        mapper: mapSarif,
        count: sarif['runs'][0]['results'].length
    }
}

const sarifToBitBucket = async () => {
    const sarifResult = fs.readFileSync(REPORT, 'utf8');
    const scanType = getScanType(sarifResult);

    let vulns = scanType.mapper(sarifResult)
    let details = `This repository contains ${scanType['count']} ${scanType['name']} vulnerabilities`

    if (vulns.length > 100) {
        vulns = vulns.slice(0, 100)
        details = `${details} (first 100 vulnerabilities shown)`
    }

    // 1. Delete Existing Report
    await axios.delete(`${BB_API_URL}/${WORKSPACE}/${REPO}/commit/${COMMIT}/reports/${scanType['id']}`,
        {
            auth: {
                username: BB_USER,
                password: BB_APP_PASSWORD
            }
        }
    )

    // 2. Create Report
    await axios.put(
        `${BB_API_URL}/${WORKSPACE}/${REPO}/commit/${COMMIT}/reports/${scanType['id']}`,
        {
            title: scanType['title'],
            details: details,
            report_type: "SECURITY",
            reporter: "sarif-to-bitbucket",
            result: "PASSED"
        },
        {
            auth: {
                username: BB_USER,
                password: BB_APP_PASSWORD
            }
        }
    )

    // 3. Upload Annotations (Vulnerabilities)
    await axios.post(`${BB_API_URL}/${WORKSPACE}/${REPO}/commit/${COMMIT}/reports/${scanType['id']}/annotations`,
        vulns,
        {
            auth: {
                username: BB_USER,
                password: BB_APP_PASSWORD
            }
        }
    )
}

const getInput = () => {
    return new Promise((resolve, reject) => {
        const stdin = process.stdin;
        let data = '';

        stdin.setEncoding('utf8');
        stdin.on('data', function (chunk) {
            data += chunk;
        });

        stdin.on('end', function () {
            resolve(data);
        });

        stdin.on('error', reject);
    });
}

if (paramsAreValid()) {
    getInput().then(sarifToBitBucket).catch(console.error)
}