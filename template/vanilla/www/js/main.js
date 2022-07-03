function showInfo() {
	document.getElementById('info').innerHTML = `<span>Server: v${NL_VERSION} | Client: v${NL_CVERSION}</span>`;
}

function openDocs() {
	Neutralino.os.open("https://neutralino.js.org/docs");
}

function openGitHub() {
	Neutralino.os.open("https://github.com/neutralinojs");
}

function onWindowClose() {
	Neutralino.app.exit();
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

window.onload = function() {
	showInfo();
};
