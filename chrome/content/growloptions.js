window.addEventListener("load", growlnotifyOptionsInit, true);

function growlnotifyOptionsAccept() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	var title = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	title.data = document.getElementById("growlnotifytitle").value;
	prefs.setComplexValue("extensions.growlnotify.title", Components.interfaces.nsISupportsString, title);
	
	var message = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	message.data = document.getElementById("growlnotifymessage").value;
	prefs.setComplexValue("extensions.growlnotify.message", Components.interfaces.nsISupportsString, message);
	
	window.close();
}

function growlnotifyOptionsNotify() {
	growlnotifyNotify(document.getElementById("growlnotifytitle").value, document.getElementById("growlnotifymessage").value, "Test subject", "Author <author@author.com>", "Recipient <recipient@recipient.com>", "Copy <carbon@copy.com>", (new Date()).getTime(), "Inbox", "My Server", 1, 12345, 123, "message@id.com");
}

function growlnotifyOptionsInit() {
	removeEventListener("load", growlnotifyOptionsInit, true);
	
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	document.getElementById("growlnotifytitle").value = prefs.getComplexValue("extensions.growlnotify.title", Components.interfaces.nsISupportsString).data;
	document.getElementById("growlnotifymessage").value = prefs.getComplexValue("extensions.growlnotify.message", Components.interfaces.nsISupportsString).data;
}
