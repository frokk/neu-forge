const { https, http } = require('follow-redirects');
const fs = require('fs');

module.exports.download = function(url, filePath) {
	return new Promise(function(resolve, reject) {
		try {
			// Simple Hack To Fix Different Protocols
			let httpModule = https;
			const urlObj = new URL(url);
			if (urlObj.protocol == "http:") httpModule = http;

			const file = fs.createWriteStream(filePath);
			const request = httpModule.get(url, function(response) {
				response.pipe(file);

				// after download completed close filestream
				file.on("finish", function() {
					file.close();
					resolve();
				});
			});
		} catch(err) {
			reject(err);
		}
	})
}