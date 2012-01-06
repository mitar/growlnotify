function growlnotifyNotify(titleFormat, messageFormat, subject, author, recipients, carbonCopy, date, folder, server, priority, messageSize, lineCount, messageID) {
	growlnotifyDebug("growlnotifyNotify called");
		
	var exec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	exec.initWithPath("/usr/local/bin/growlnotify");
	if (exec.exists()) {
		var title = growlnotifyFormat(titleFormat, subject, author, recipients, carbonCopy, date, folder, server, priority, messageSize, lineCount, messageID);
		var message = growlnotifyFormat(messageFormat, subject, author, recipients, carbonCopy, date, folder, server, priority, messageSize, lineCount, messageID);
		
		// Strings are (hopefully) in UTF-16 -> convert them to UTF-8
		var uc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
		createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		uc.charset = "UTF-8";
		title = uc.ConvertFromUnicode(title) + uc.Finish();
		message = uc.ConvertFromUnicode(message) + uc.Finish();
		
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		var args = ["-n", "Thunderbird (add-on)", "-a", "Thunderbird.app", "-t", title, "-m", message];
		
		growlnotifyDebug("initializing growlnotify process");
		
		process.init(exec);
		// We should wait for the process to finish because otherwise growlnotify command line program gets
		// into some kind of a deadlock when processing many new messages
		var exitvalue = process.run(true, args, args.length);
		
		growlnotifyDebug("growlnotify process ran");
	}
	else {
		growlnotifyDebug("/usr/local/bin/growlnotify not found");
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "Growl New Message Notification", "Required growlnotify extra has not been found.\nPlease install it.");
	}
}

function growlnotifyFormat(format, subject, author, recipients, carbonCopy, date, folder, server, priority, messageSize, lineCount, messageID) {
	var formatSplit = format.split(/(%[sarcdfvpbklm%])/);
	
	for (var i = 0; i < formatSplit.length; i++) {
		switch (formatSplit[i]) {
			case "%s":
				formatSplit[i] = subject;
				break;
			case "%a":
				formatSplit[i] = author;
				break;
			case "%r":
				formatSplit[i] = recipients;
				break;
			case "%c":
				formatSplit[i] = carbonCopy;
				break;
			case "%d":
				formatSplit[i] = (new Date(date)).toLocaleString();
				break;
			case "%f":
				formatSplit[i] = folder;
				break;
			case "%v":
				formatSplit[i] = server;
				break;
			case "%p":
				formatSplit[i] = priority;
				break;
			case "%b":
				formatSplit[i] = messageSize;
				break;
			case "%k":
				formatSplit[i] = Math.round(messageSize / 1000);
				break;
			case "%l":
				formatSplit[i] = lineCount;
				break;
			case "%m":
				formatSplit[i] = messageID;
				break;
			case "%%":
				formatSplit[i] = "%";
				break;
		}
	}
	
	return formatSplit.join("");
}

function growlnotifyDebug(message) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var debug = prefs.getIntPref("extensions.growlnotify.debug");
	
	if (debug == 1) {
		dump("growlnotify: " + message + "\n");
	}
	else if (debug == 2) {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "Growl New Message Notification", message);	
	}
}
