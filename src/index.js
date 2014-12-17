var template = require("template"),
    environment = require("environment");


var ejs = module.exports,
    readFile, fs;


function mixin(a, b) {
    var key, value;

    for (key in b) {
        if (a[key] == null && (value = b[key]) != null) a[key] = value;
    }
    return a;
}

if (environment.browser) {
    readFile = function readFile(path, encoding, callback) {
        var xhr = new XMLHttpRequest();

        function oncomplete() {
            var status = +xhr.status;

            if ((status > 199 && status < 301) || status === 304) {
                callback(null, xhr.responseText);
            } else {
                callback(new Error(status));
            }
        }

        if (xhr.addEventListener) {
            xhr.addEventListener("load", oncomplete, false);
            xhr.addEventListener("error", oncomplete, false);
        } else {
            xhr.onreadystatechange = function onreadystatechange() {
                if (+xhr.readyState === 4) {
                    oncomplete();
                }
            };
        }

        xhr.open("GET", path, true);
        if (xhr.setRequestHeader) {
            xhr.setRequestHeader("Content-Type", "text/plain");
        }
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
