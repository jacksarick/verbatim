// We need the log library
const log = require("./log.js");

// Basic method for testing if a list contains a value
Array.prototype.contains = function (value) { return this.indexOf(value) > -1 };

// Basic method for testing if an object contains a key
Object.prototype.has = function (key) { return this[key] != undefined };

// Function to clean up the input
function clean(string) {
	// split the string on each :
	var r = string.split(" ");

	// Take all except the first
	r = r.slice(1, r.length).join(" ");

	// return result
	return r;
}

// Function to pull data from a given path
function find(data, path) {
	// This is actually a cool little piece of code IMO. The recursion loops through each argument and applys them one by one to the data
	if (path.length === 0){
		return data;
	}

	return find(data[path.shift()], path);
}

// Function to change a var at the end of a path
function update(data, path, value) {
	// Pretty much the same as GET, but returns full lists, and returns the new value instead of the actual
	if (path.length === 1){
		data[path[0]] = value;
		return data;
	}

	data[path[0]] = update(data[path.shift()], path, value);
	return data;
}

// Dictionary of all commands for the client
var dict = {
	GET: function(key) {
		// We are going to split the key, then use it as a path to find a value in the database. Once we have the data, we return the data as a string
		return JSON.stringify(find(response.db, clean(key).split(".")));
	},

	SET: function(input) {
		input = clean(input).split(" ")
		const key = input[0].split(".");
		const value = input.slice(1, input.length).join(" ");

		response.db = update(response.db, key, value);
		return value + " updated";

	},

	ECHO: function(d) {
		// Send the data sent
		return clean(d);
	},

	BYE: function() {
		// The termination will take priority over the return
		response.socket.end("disconnected");
	},
};

var response = {
	// This will be our basic function that only sends data.
	send: function(msg) {
		this.socket.write(msg + "\n");
	},

	// A slightly more advanced function that also logs it
	write: function(msg) {
		this.send(msg);
		log.info(msg);
	},

	// Return the command, or lack thereof
	command: function(data) {
		data = data.split(" ")[0].toUpperCase();

		// If the command is in the dictionary...
		if (dict.has(data)){
			// Return the associated function
			return dict[data];
		}

		// If no command is found, return an empty function, so not to break anything
		else {
			return function() {};
		}
	},

	// Parse incoming data
	parse: function(data) {
		return data.toString().trim();
	}
}

module.exports = response;