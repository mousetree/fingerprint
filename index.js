'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const _ = require('lodash');

class Device {

	constructor(options) {
		this.host = options.host;
		this.username = options.username;
		this.password = options.password;
		this.baseUrl = `http://${options.host}`;
		this._jar = request.jar();
	}

	/*
		We need a cookie before we can login
	 */
	_getCookie() {
		return request.get({
			url: this.baseUrl,
			jar: this._jar
		});
	}

	/*
		We need to login before we can query
	 */
	_login() {
		return request.post({
			url: this.baseUrl + '/csl/check',
			jar: this._jar,
			form: {
				username: this.username,
				userpwd: this.password
			}
		});
	}

	/*
		We always need the cookie and a valid login
	 */
	_init() {
		return this._getCookie()
			.then(this._login.bind(this));
	}

	_requestLogs(startDate) {
		startDate = startDate || new Date();
		const date = startDate.toISOString().substring(0, 10);
		let form = `sdate=${date}&edate=${date}&period=1`;
		_.range(50).forEach(x => {
			form = form + '&uid=' + x;
		});
		return request.post({
			url: this.baseUrl + '/csl/query?action=run',
			jar: this._jar,
			form
		});
	}

	_parseLogs(logHTML) {
		const logs = [];
		const $ = cheerio.load(logHTML);
		$('tr:not(.table_header)').each((i, tr) => {
			const children = $(tr).children();
			const date = children[0].children[0].data.trim();
			const name = children[2].children[0].data.trim();
			const time = children[3].children[0].data.trim();
			logs.push({
				timestamp: new Date([date, time].join(' ')),
				name
			});
		});
		return logs;
	}

	getLogs(startDate) {
		return this._init().then(() => {
			return this._requestLogs(startDate)
				.then(this._parseLogs);
		});
	}

	summariseLogs(logs) {
		const summary = [];
		const indexed = _.groupBy(logs, 'name');
		_.forEach(indexed, (entries, name) => {
			const firstEntry = _.minBy(entries, 'timestamp').timestamp;
			summary.push({
				name,
				entries: entries.length,
				firstEntry: firstEntry.toLocaleString()
			});
		});
		return summary;
	}

	openDoor() {
		return this._init().then(() => {
			return request.post({
				url: this.baseUrl + '/form/Device?act=22',
				jar: this._jar,
				form: {
					adminpwd: this.password
				}
			});
		});
	}
}

module.exports = Device;
