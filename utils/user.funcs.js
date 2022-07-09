var emailRegex =
	/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

const isEmailValid = (email) => {
	if (!email) return false;

	if (email.length > 254) return false;

	var valid = emailRegex.test(email);
	if (!valid) return false;

	// Further checking of some things regex can't handle
	var parts = email.split("@");
	if (parts[0].length > 64) return false;

	var domainParts = parts[1].split(".");
	if (
		domainParts.some(function (part) {
			return part.length > 63;
		})
	)
		return false;

	return true;
};

exports.verifySignUpData = (username, email, password) => {
	return new Promise((resolve, reject) => {
		if (!username || typeof username != "string") {
			reject("Invalid Username");
		}

		if (username.length < 5) {
			reject("Username must be at least 5 characters");
		}

		if (!email || !isEmailValid(email)) {
			reject("Invalid Email");
		}

		if (!password || typeof password !== "string") {
			reject("Invalid Password");
		}

		if (password.length < 5) {
			reject("Password must be at least 5 characters");
		}

		resolve();
	});
};