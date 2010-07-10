// There are namespace conflicts so all constants are prepended with GROWLNOTIFY

// From nsMsgFolderFlags.h
const GROWLNOTIFY_MSG_FOLDER_FLAG_TRASH = 0x0100;
const GROWLNOTIFY_MSG_FOLDER_FLAG_JUNK = 0x40000000;
const GROWLNOTIFY_MSG_FOLDER_FLAG_SENTMAIL = 0x0200;
const GROWLNOTIFY_MSG_FOLDER_FLAG_IMAP_NOSELECT = 0x1000000;
const GROWLNOTIFY_MSG_FOLDER_FLAG_CHECK_NEW = 0x20000000;
const GROWLNOTIFY_MSG_FOLDER_FLAG_INBOX = 0x1000;

// From nsMsgMessageFlags.h
const GROWLNOTIFY_MSG_FLAG_NEW = 0x10000;

window.addEventListener("load", growlnotifyInit, true);

var growlnotifyListener = {
	OnItemAdded: function(parentItem, item) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		
		var header = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
		var folder = header.folder.QueryInterface(Components.interfaces.nsIMsgFolder);
		
		growlnotifyDebug("message added to the \"" + folder.prettyName + "\" folder");
		
		// Translated from nsImapMailFolder.cpp
		var checkAllFolders = prefs.getBoolPref("mail.check_all_imap_folders_for_new");
		var checkThisFolder = ((checkAllFolders && !(folder.flags & (GROWLNOTIFY_MSG_FOLDER_FLAG_TRASH | GROWLNOTIFY_MSG_FOLDER_FLAG_JUNK | GROWLNOTIFY_MSG_FOLDER_FLAG_SENTMAIL | GROWLNOTIFY_MSG_FOLDER_FLAG_IMAP_NOSELECT))) || (folder.flags & (GROWLNOTIFY_MSG_FOLDER_FLAG_CHECK_NEW | GROWLNOTIFY_MSG_FOLDER_FLAG_INBOX)));
		
		growlnotifyDebug("\"mail.check_all_imap_folders_for_new\": " + (checkAllFolders ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_TRASH: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_TRASH ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_JUNK: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_JUNK ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_SENTMAIL: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_SENTMAIL ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_IMAP_NOSELECT: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_IMAP_NOSELECT ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_CHECK_NEW: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_CHECK_NEW ? "true" : "false"));
		growlnotifyDebug("folder flag MSG_FOLDER_FLAG_INBOX: " + (folder.flags & GROWLNOTIFY_MSG_FOLDER_FLAG_INBOX ? "true" : "false"));
		growlnotifyDebug("message flag MSG_FLAG_NEW: " + (header.flags & GROWLNOTIFY_MSG_FLAG_NEW ? "true" : "false"));
				
		// Checks if this is really a new message which was added
		if (checkThisFolder && (header.flags & GROWLNOTIFY_MSG_FLAG_NEW)) {
			growlnotifyDebug("decided to show notification");
			
			// Gets title and message format strings
			var titleFormat = prefs.getComplexValue("extensions.growlnotify.title", Components.interfaces.nsISupportsString).data;
			var messageFormat = prefs.getComplexValue("extensions.growlnotify.message", Components.interfaces.nsISupportsString).data;
			
			var server = folder.server.QueryInterface(Components.interfaces.nsIMsgIncomingServer);
			
			// There is no decoded CC list attribute in a header object (is there any higher level function for this?)
			var msgHeaderParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);
			var addresses = {};
			var fullNames = {};
			var names = {};
			msgHeaderParser.parseHeadersWithArray(header.ccList, addresses, names, fullNames);
			var cclist = fullNames.value.join(", ");
			
			growlnotifyNotify(titleFormat, messageFormat, header.mime2DecodedSubject, header.mime2DecodedAuthor, header.mime2DecodedRecipients, cclist, Math.round(header.date / 1000), folder.prettyName, server.prettyName, header.priority, header.messageSize, header.lineCount, header.messageId);
		}
		else {
			growlnotifyDebug("decided not to show notification");
		}
	},
	OnItemBoolPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemEvent: function(item, event) {},
	OnItemIntPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemPropertyChanged: function(item, property, oldValue, newValue) {},
	OnItemPropertyFlagChanged: function(item, property, oldFlag, newFlag) {},
	OnItemRemoved: function(parentItem, item, view) {},
	OnItemUnicharPropertyChanged: function(item, property, oldValue, newValue) {}
};

function growlnotifyInit() {
	removeEventListener("load", growlnotifyInit, true);
	
	growlnotifyDebug("growlnotifyNotify initializing");
	
	// Adds a listener which will be called only when a message is added to the folder
	var mailSession = Components.classes["@mozilla.org/messenger/services/session;1"].getService(Components.interfaces.nsIMsgMailSession);
	mailSession.AddFolderListener(growlnotifyListener, Components.interfaces.nsIFolderListener.added);
}
