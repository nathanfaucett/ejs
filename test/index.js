var tape = require("tape"),
    ejs = require("..");


tape("ejs(path, options, callback)", function(assert) {
    ejs.render(__dirname + "/template.ejs", {
        cache: true,
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
        assert.equals(html, '<h1>List</h1>\n\n<ul>\n  \n    <li>Title 1</li>\n  \n    <li>Title 2</li>\n  \n    <li>Title 3</li>\n  \n</ul>\n');
        assert.end();
    });

});
