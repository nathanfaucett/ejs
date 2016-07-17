var mixin = require("@nathanfaucett/mixin"),
    template = require("@nathanfaucett/template"),
    environment = require("@nathanfaucett/environment"),
    XMLHttpRequestPolyfill;


var ejs = module.exports,
    readFile, fs;


if (environment.browser) {
    XMLHttpRequestPolyfill = require("@nathanfaucett/xmlhttprequest_polyfill");

    readFile = function readFile(path, encoding, callback) {
        var xhr = new XMLHttpRequestPolyfill();

        function oncomplete() {
            var status = +xhr.status;

            if ((status > 199 && status < 301) || status === 304) {
                callback(null, xhr.responseText);
            } else {
                callback(new Error(status));
            }
        }

        xhr.addEventListener("load", oncomplete, false);
        xhr.addEventListener("error", oncomplete, false);

        xhr.open("GET", path, true);
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.send();
    };
} else {
    fs = require("fs");

    readFile = function readFile(path, encoding, callback) {
        fs.readFile(path, encoding, function(err, data) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, data.toString(encoding));
        });
    };
}


ejs.templates = {};
ejs.settings = {
    start: "<%",
    end: "%>",
    interpolate: "=",
    escape: "-"
};

ejs.render = function(path, options, callback) {
    var encoding = options.encoding || "utf-8",
        cache = !!options.cache,
        cached = cache ? ejs.templates[path] : null;

    options.locals || (options.locals = {});
    options.settings = mixin(options.settings || {}, ejs.settings);

    if (!cached) {
        readFile(path, encoding, function(err, data) {
            var fn;

            if (err) {
                callback(err);
                return;
            }

            try {
                fn = template(data, null, options.settings);
            } catch (e) {
                callback(e);
                return;
            }

            if (cache) {
                ejs.templates[path] = fn;
            }

            render(fn, options.locals, callback);
        });
    } else {
        render(cached, options.locals, callback);
    }
};


function render(temp, locals, callback) {
    var str;

    try {
        str = temp(locals);
    } catch (e) {
        callback(e);
        return;
    }

    callback(null, str);
}
