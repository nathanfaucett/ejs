var utils = require("utils");


var isBrowser = typeof(window) !== "undefined",
    ejs = module.exports,
    readFile, fs;


if (isBrowser) {
    readFile = function(path, encoding, callback) {
        var request = new XMLHttpRequest;

        request.addEventListener("load", function() {
            var status = this.status;

            if ((status > 199 && status < 301) || status == 304) {
                callback(null, this.responseText);
            } else {
                callback(new Error(status));
            }
        }, false);
        request.addEventListener("error", function() {
            callback(new Error("ENOENT"));
        }, false);

        request.open("GET", src, true);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send();
    };
} else {
    fs = require("fs");
    
    readFile = function(path, encoding, callback) {
        fs.readFile(path, encoding, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            
            callback(null, data.toString(encoding));
        });
    }
}


ejs.templates = {};
ejs.settings = {
	start: "<%",
    end: "%>",
    interpolate: "=",
    escape: "-"
};

ejs.render = function(path, opts, callback) {
    var encoding = opts.encoding || "utf-8",
        cache = !!opts.cache,
        cached = cache ? ejs.templates[path] : null;
    
	opts.settings = utils.mixin(opts.settings || {}, ejs.settings);
	
    if (!cached) {
        readFile(path, encoding, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            var fn;
            
            try {
                fn = utils.template(data, null, opts.settings);
            } catch(e) {
                callback(e);
                return;
            }
            
            if (cache) ejs.templates[path] = fn;
            render(fn, opts.locals, callback);
        });
    } else {
        render(cached, opts.locals, callback);
    }
};


function render(template, locals, callback) {
    var str;
    
    try{
        str = template(locals);
    } catch(e) {
        callback(e);
        return;
    }
    
    callback(null, str);
}