/** @module dropbox-syncer */
const _ = require("lodash");
const fs = require("fs-extra");
const unzip = require("unzip");
const got = require("got");
const streamifier = require("streamifier");

module.exports = class DropboxSyncer {
    /**
        Initializes the syncer with the token needed to access dropbox
        @constructor
        @param {string} tok The token to access dropbox
    */
    
    constructor(tok) {
        this.accessToken = tok;
    }

    /**
        Downloads a dropbox folder as a ZIP and unpacks it to a local folder
        @param {string} dbxPath The dropbox path to download from
        @param {string} path The local path to download to
        @return {Promise} A promise that resolves with the paths that 
        were updated
    */
    downloadAll(dbxPath, path) {
        return this.contentDownload("files/download_zip", { "path": dbxPath })
            .then((result) => {
                return new Promise((resolve, reject) => {
                    // As of the writing of this code, got.stream.post is broken
                    // So we need to make a buffer
                    streamifier.createReadStream(result.body)
                        .pipe(unzip.Extract({path: path}))
                        .on("finish", () => {
                            resolve({path: path});
                        })
                        .on("error", (err) => {
                            reject(err);
                        });
                });
            });
    }
    
    /**
        A function that is called whenever files are updated by the longpoll
        @callback onUpdate
        @param {Object} files The files that were changed, as returned by the Dropbox API
        @return {undefined}
    */
    
    /**
        Starts a long poll for checking changes in a dropbox folder to update a local folder
        Loops into itself on either timeout or change
        @param {string} dbxPath The dropbox path to watch
        @param {string} path The local path to update on change
        @param {onUpdate} [callback] The callback that runs whenever the files are updated
        @return {undefined}
    */
    updateOnChange(dbxPath, path, callback = () => {} ) {
        let backoff = 0; // seconds
        let timeout = 10; // seconds
        let msPerSec = 1000;
        let loop = (cursor) => {
            setTimeout(() => {
                return this.rpc(
                    "files/list_folder/longpoll",
                    { "cursor": cursor, "timeout": 30 },
                    "notify.dropboxapi.com",
                    false
                )
                    .then((result) => {
                        if (result.body.changes) {
                            backoff = result.body.backoff;
                            return this.rpc("files/list_folder/continue", { "cursor": cursor })
                                .then((listResult) => {
                                    cursor = listResult.body.cursor;
                                    return this.updateFiles(listResult.body.entries, path);
                                })
                                .then((listResult) => {
                                    // Return to polling after downloading everything
                                    callback(listResult);
                                    return loop(cursor);
                                });
                        }
                        else {
                            return loop(cursor);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        console.log(err.response.body);
                        // We want to have some sort of timeout if there's an error
                        backoff = timeout;
                        return loop(cursor);
                    });
            }, backoff * msPerSec);
        };
        
        this.rpc("files/list_folder/get_latest_cursor", {
            "path": dbxPath,
            "recursive": true,
            "include_media_info": false,
            "include_deleted": false,
            "include_has_explicit_shared_members": false,
            "include_mounted_folders": false
        })
            .then((result) => {
                loop(result.body.cursor);
            })
            .catch((err) => {
                console.log(err);
                console.log(err.response.body);
            });
    }
    
    /**
        Downloads multiple files from dropbox
        @param {Array} files The files to download, as retrieved from the dropbox API
        @param {String} localPath The local path to downlaod the files to
        @return {Promise} A promise that resolves to the file changes when all the files have been changed
    */
    updateFiles(files, localPath) {
        let promises = [];
        _.forEach(files, (entry) => {
            switch(entry[".tag"]) {
            case "file":
                promises.push(this.contentDownload("files/download", { "path": entry.path_lower })
                    .then((downloadResult) => {
                        return fs.outputFile(localPath + entry.path_lower, downloadResult.body, "binary");
                    }));
                break;
            case "folder":
                promises.push(fs.ensureDir(localPath + entry.path_lower));
                break;
            case "deleted":
                promises.push(fs.remove(localPath + entry.path_lower));
                break;
            }
        });
        return Promise.all(promises)
            .then(() => {
                return Promise.resolve(files);
            });
    }
    
    /**
        Makes a Dropbox API call for a Content-download endpoint
        @param {string} type The API call to make. Example: "files/download"
        @param {Object} params The parameters for the API call
        @return {Promise} A promise that resolves when the API call is finished
    */
    contentDownload(type, params) {
        return got.post("https://content.dropboxapi.com/2/" + type, {
            headers: {
                "Authorization": "Bearer " + this.accessToken,
                "Dropbox-API-Arg": JSON.stringify(params)
            },
            encoding: null
        });
    }

    /**
        Makes a Dropbox API call for an RPC endpoint
        @param {string} type The API call to make. Example: "files/list_folders"
        @param {Object} params The parameters for the API call
        @param {string} [host] The host to use as the endpoint. Defaults to "api.dropbox.com"
        @param {boolean} [authorize] Whether to authorize with the token or not. Defaults to "true"
        @return {Promise} A promise that resolves when the API call is finished
    */
    rpc(type, params, host = "api.dropboxapi.com", authorize = true) {
        return got.post("https://" + host + "/2/" + type, {
            headers: {
                "Authorization": authorize ? ("Bearer " + this.accessToken) : undefined,
                "Content-Type": "application/json"
            },
            body: params,
            json: true
        });
    }
};