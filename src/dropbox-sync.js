/** @module dropbox-syncer */
const _ = require("lodash");
const ofs = require("fs");
const fs = require("fs-extra");
const decompress = require("decompress");
const got = require("got");

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
		Downloads a dropbox folder as a ZIP and unpacks it to 
		@param {string} dbxPath The dropbox path to download from
		@param {string} path The local path to download to
		@return {Promise} A promise that resolves with the paths that were updated
	*/
	downloadAll(dbxPath, path) {
		//return this.dropbox.filesDownloadZip({"path": dbxPath})
		return got.post("https://content.dropboxapi.com/2/files/download_zip", {
			headers: {
				"Authorization": "Bearer " + this.accessToken,
				"Dropbox-API-Arg": JSON.stringify({ "path": dbxPath })
			},
			encoding: null
		})
			.then((result) => {
				decompress(result.body, path);
			});
	}
	
	/**
		Downloads a list of files into a folder
		@param {(FilesListFolderResult)} files
	*/
};