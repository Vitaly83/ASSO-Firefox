"use strict";

const
    Cc = Components.classes,
    Ci = Components.interfaces,
    Cu = Components.utils,
    XMLHttpRequest  = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest"),
    Notification = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIDOMDesktopNotification");

Cu.import("resource://gre/modules/Services.jsm");

/**
 * Called when the extension needs to start itself up. This happens at application launch time or when the extension is enabled after being disabled (or after it has been shut down in order to install an update. As such, this can be called many times during the lifetime of the application.
 *
 * Bootstrap data structure @see https://developer.mozilla.org/en-US/docs/Extensions/Bootstrapped_extensions#Bootstrap_data
 * &#10;  string id
 * &#10;  string version
 * &#10;  nsIFile installPath
 * &#10;  nsIURI resourceURI
 * &#10;
 * Reason types:
 * &#10;  APP_STARTUP
 * &#10;  ADDON_ENABLE
 * &#10;  ADDON_INSTALL
 * &#10;  ADDON_UPGRADE
 * &#10;  ADDON_DOWNGRADE
 *
 * @param data
 * @param reason
 */
function startup(data, reason) {
    ASSO.init();
}

/**
 * Called when the extension needs to shut itself down, such as when the application is quitting or when the extension is about to be upgraded or disabled. Any user interface that has been injected must be removed, tasks shut down, and objects disposed of.
 *
 * Bootstrap data structure @see https://developer.mozilla.org/en-US/docs/Extensions/Bootstrapped_extensions#Bootstrap_data
 * &#10;  string id
 * &#10;  string version
 * &#10;  nsIFile installPath
 * &#10;  nsIURI resourceURI
 * &#10;
 * Reason types:
 * &#10;  APP_SHUTDOWN
 * &#10;  ADDON_DISABLE
 * &#10;  ADDON_UNINSTALL
 * &#10;  ADDON_UPGRADE
 * &#10;  ADDON_DOWNGRADE
 *
 * @param data
 * @param reason
 */
function shutdown(data, reason) {

}

/**
 * Your bootstrap script must include an install() function, which the application calls before the first call to startup() after the extension is installed, upgraded, or downgraded.
 *
 * Bootstrap data structure @see https://developer.mozilla.org/en-US/docs/Extensions/Bootstrapped_extensions#Bootstrap_data
 * &#10;  string id
 * &#10;  string version
 * &#10;  nsIFile installPath
 * &#10;  nsIURI resourceURI
 * &#10;
 * Reason types:
 * &#10;  ADDON_INSTALL
 * &#10;  ADDON_UPGRADE
 * &#10;  ADDON_DOWNGRADE
 *
 * @param data
 * @param reason
 */
function install(data, reason) {
    ASSO.init();
}

/**
 * This function is called after the last call to shutdown() before a particular version of an extension is uninstalled. This will not be called if install() was never called.
 *
 * Bootstrap data structure @see https://developer.mozilla.org/en-US/docs/Extensions/Bootstrapped_extensions#Bootstrap_data
 * &#10;  string id
 * &#10;  string version
 * &#10;  nsIFile installPath
 * &#10;  nsIURI resourceURI
 * &#10;
 * Reason types:
 * &#10;  ADDON_UNINSTALL
 * &#10;  ADDON_UPGRADE
 * &#10;  ADDON_DOWNGRADE
 *
 * @param data
 * @param reason
 */
function uninstall(data, reason) {

}

var ASSO = {
    "propManager" : null,
    "prefManager" : null,
    "timer" : null
};

ASSO.init = function () {
    ASSO.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    ASSO.timer.initWithCallback(function (timer) {ASSO.getContent();}, 15000, Ci.nsITimer.TYPE_REPEATING_PRECISE);

    var apiKey = this.getPref("api_key", "char");
    if (apiKey == "") {
        //Services.wm.getMostRecentWindow('navigator:browser').BrowserOpenAddonsMgr();
        Services.wm.getMostRecentWindow('navigator:browser').BrowserOpenAddonsMgr('addons://detail/asso_notifier/preferences');
    }
};

ASSO.getProp = function (id) {
    if (this.propManager == null) {
        this.propManager = Services.strings.createExtensibleBundle("messages");
    }
    try {
        return this.propManager.getString(id);
    } catch (e) {
        return this.propManager.GetStringFromName(id);
    }
};

ASSO.getPref = function (id, type) {
    if (this.prefManager == null) {
        this.prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    }
    id = "extensions.asso_notifier." + id;
    try {
        switch (type) {
            case "char":
                return this.prefManager.getCharPref(id);
            case "int":
                return this.prefManager.getIntPref(id);
            case "bool":
                return this.prefManager.getBoolPref(id);
        }
    } catch (e) {
        switch (type) {
            case "char":
                return "";
            case "int":
                return 0;
            case "bool":
                return false;
        }
    }
};

ASSO.setPref = function (id, value, type) {
    if (this.prefManager == null) {
        this.prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    }
    id = "extensions.asso_notifier." + id;
    try {
        switch (type) {
            case "char":
                return this.prefManager.setCharPref(id, value);
            case "int":
                return this.prefManager.setIntPref(id, value);
            case "bool":
                return this.prefManager.setBoolPref(id, value);
        }
    } catch (e) {
        // console.error(e.message);
    }
};

ASSO.ajax = function (url, success, failure) {
    try {
        var xmlhttp = new XMLHttpRequest();
        if (success || failure) {
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        if (success) {
                            success(xmlhttp.response, xmlhttp);
                        }
                    } else if (xmlhttp.status >= 400 || xmlhttp.status < 100) {
                        if (failure) {
                            failure(xmlhttp.response, xmlhttp);
                        }
                    }
                }
            };
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.setRequestHeader("Content-Type", "text/html; charset=UTF-8");
        xmlhttp.setRequestHeader("Expires", "Sat, 26 Jul 1997 05:00:00 GMT");
        xmlhttp.setRequestHeader("Last-Modified", "Sat, 26 Jul 1997 05:00:00 GMT");
        xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        xmlhttp.setRequestHeader("Cache-Control", "pre-check=0, post-check=0, max-age=0");
        xmlhttp.setRequestHeader("Pragma", "no-cache");
        xmlhttp.setRequestHeader("Expires", "0");
        xmlhttp.send(null);
    } catch (e) {
        // console.log(e.message);
        return false;
    }
};

ASSO.getContent = function () {
    var apiKey = this.getPref("api_key", "char");
    if (apiKey == "") {
        // TODO: Открыть диалог ввода ключа, если значение не установлено
        return false;
    }
    var today = Date.now();
    if (today < this.getPref("last_order_date", "int")) {
        return false;
    }
    var assoApiBaseUrl = "http://asso.orbitsoft/api",
        urlStatus = assoApiBaseUrl + "/dinners/menu/status?access_token=" + encodeURIComponent(apiKey),
        urlMy = assoApiBaseUrl + "/orders/today/my?access_token=" + encodeURIComponent(apiKey);
    ASSO.ajax(urlStatus, function (data) { // success
        data = JSON.parse(data);
        if (data.status == "ok") {
            if (data.data.is_ready == true) {
                ASSO.ajax(urlMy, function (data) { // success
                    data = '{"status":"error"}';
                    data = JSON.parse(data);
                    if (data.status == "error") {
                        console.log("here");
                        var notification = new Notification("ASSO", {
                            "tag" : "asso",
                            "icon" : "chrome://asso_notifier/skin/icon-48.png",
                            "body" : "Уважаемый, заказываем еду"
                        });
                        setTimeout(notification.close.bind(notification), 15000);
                        notification.onclick = function (event) {
                            window.open("http://asso.orbitsoft/", "_blank");
                        }
                    } else {
                        ASSO.timer.cancel();
                    }
                    ASSO.setPref("last_order_date", today, "int");
                }, function (data, xmlhttp) { // failure
                    return false;
                });
            }
        }
    }, function (data, xmlhttp) { // failure
        // console.log(data, xmlhttp);
        return false;
    });
    return true;
};
