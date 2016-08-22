'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const _ = require('lodash');

const _cookieJar = request.jar();
const _username = process.env.FINGERPRINT_USER;
const _password = process.env.FINGERPRINT_PASSWORD;
const _url = process.env.FINGERPRINT_URL;

module.exports = {
	getLogs,
	summariseLogs,
	openDoor
};

function getLogs() {
	console.log(`Requesting logs...`);
	return init()
		.then(requestLogs)
		.then(parseLogs);
}

function summariseLogs(logs) {
	console.log(`Summarising logs...`);
	const summary = [];
	const indexed = _.groupBy(logs, 'name');
	_.forEach(indexed, (entries, name) => {
		const firstEntry = _.minBy(entries, 'timestamp').timestamp;
		summary.push({
			name,
			entries: entries.length,
			firstEntry
		});
	});
	return _.sortBy(summary, x => {
		return x.firstEntry.getTime();
	});
}

function openDoor() {
	console.log(`Opening door...`);
	return init()
		.then(() => {
			return request.post({
				url: _url + '/form/Device?act=22',
				jar: _cookieJar,
				form: {adminpwd: _password}
			});
		});
}

function validate() {
	[
	'FINGERPRINT_USER',
	'FINGERPRINT_PASSWORD',
	'FINGERPRINT_URL'

	].forEach(v => {
		if (!process.env[v]) {
			throw new Error(`Please define the ${v} env variable`);
		}
	});
}

function init() {
	validate();
	return getCookie()
		.then(login);
}

function getCookie() {
	return request.get({
		url: _url,
		jar: _cookieJar
	});
}

function login() {
	return request.post({
		url: _url + '/csl/check',
		jar: _cookieJar,
		form: {
			username: _username,
			userpwd: _password
		}
	});
}

function requestLogs() {
	const today = new Date();
	const date = today.toISOString().substring(0, 10);
	let form = `sdate=${date}&edate=${date}&period=1`;
	_.range(50).forEach(x => {
		form = form + '&uid=' + x;
	});
	return request.post({
		url: _url + '/csl/query?action=run',
		jar: _cookieJar,
		form
	});
}

function parseLogs(logHTML) {
	const logs = [];
	const $ = cheerio.load(logHTML);
	$('tr:not(.table_header)').each((i, tr) => {
		const children = $(tr).children();
		const date = children[0].children[0].data.trim();
		const name = children[2].children[0].data.trim();
		const time = children[3].children[0].data.trim();
		logs.push({
			date,
			time,
			timestamp: new Date([date, time].join(' ')),
			name
		});
	});
	return logs;
}

