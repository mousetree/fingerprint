'use strict';

const Fingerprint = require('./fingerprint');

Fingerprint
	.getLogs()
	.then(Fingerprint.summariseLogs)
	.then(logs => {
		logs.forEach(log => {
			let entry = new Date(log.firstEntry);
			let hh = entry.getHours();
			let mm = entry.getMinutes();
			console.log(`[${hh}:${mm}]\t${log.name}`);
		});
	});
