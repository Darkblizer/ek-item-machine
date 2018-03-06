/** @module text-reader */
const fs = require("fs-extra");

module.exports = class TextReader {
    /**
        Reads a random line from a file
        @param {string} path The path to the file to read
        @return {string} The line read
    */
    static readRandom(path) {
        return fs.readFile(path, "utf-8")
            .then((file) => {
                let lines = file.replace("\r", "").split("\n");
                return Promise.resolve(lines[Math.floor(Math.random() * lines.length)]);
            });
    }
}