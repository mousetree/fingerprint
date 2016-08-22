# Fingerprint

Using the bundled web interface of the [F18-ID Fingerprint Reader](http://www.zkaccess.com/product/f18/)
the following code allows you to:

* Get access logs
* Get summary of access logs
* Open the door

# Usage

	const device = new Device({
		host: '192.168.1.1',
		username: 'administrator',
		password: 'password'
	});

	device.getLogs()
		.then(device.summariseLogs)
		.then(console.log);

	device.openDoor()
