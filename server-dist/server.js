"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 0; // JANGAN pakai 3000
const app = (0, next_1.default)({ dev: false });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    (0, http_1.createServer)((req, res) => {
        handle(req, res);
    }).listen(port, () => {
        console.log("Server running on port " + port);
    });
});
