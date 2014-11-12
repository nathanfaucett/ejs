global.ejs = require("../src/index.js");


ejs.render("example/template.ejs", {
    locals: {
        list: [{
            title: "Title 1"
        }, {
            title: "Title 2"
        }, {
            title: "Title 3"
        }],
        each: function(array, fn) {
            var index = -1,
                length = array.length - 1;

            while (index++ < length) {
                if (fn(array[index], index) === false) {
                    return false;
                }
            }

            return array;
        }
    }
}, function(err, html) {
    var el = document.getElementById("app");

    el.innerHTML = html;
});
