"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesFormatter = exports.messages = void 0;
const fs = require("fs");
const pt = require("path");
const format = require("string-format");
class Messages {
    run_failed;
    converting_static_analysis_report_to_sarif;
    converted_sarif_report;
    exit_code;
    deserialize(jsonPath) {
        const buf = fs.readFileSync(jsonPath);
        const json = JSON.parse(buf.toString('utf-8'));
        return json;
    }
}
class Formatter {
    format(template, ...args) {
        return format(template, ...args);
    }
}
const jsonPath = pt.join(__dirname, 'messages/messages.json');
exports.messages = new Messages().deserialize(jsonPath);
exports.messagesFormatter = new Formatter();
//# sourceMappingURL=messages.js.map