# Fingerprint

Using the bundled web interface of the [F18-ID Fingerprint Reader](http://www.zkaccess.com/product/f18/)
the following code allows you to:

* Get access logs
* Get summary of access logs
* Open the door

# Install

	npm install

# Usage

Set the environment variables as follows:

	export FINGERPRINT_USER=administrator
	export FINGERPRINT_PASSWORD=mypassword
	export FINGERPRINT_HOST=http://192.168.1.100

The `fingerprint.js` library can then be included (see `index.js` for an example)
