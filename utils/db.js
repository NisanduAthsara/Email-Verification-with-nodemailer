const mongoose = require("mongoose");

//connect to mongodb
exports.connect = () => {
	return new Promise((resolve, reject) => {
		mongoose
			.connect(process.env.MONGO)
			.then(() => {
				resolve();
			})
			.catch(reject);
	});
};