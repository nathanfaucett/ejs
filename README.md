EJS
=======

ejs for the browser and node.js

```javascript
var ejs = require("ejs");


/*
path/to/template.ejs

<h1>List</h1>

<ul>
  <% each(list, function(item) { %>
    <li><%= item.title %></li>
  <% }); %>
</ul>
*/

ejs.render("path/to/template.ejs", {
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
}, function(error, html) {
    var el;

    if (error) {
        //handle error
    } else {
        el = document.getElementById("app");
        el.innerHTML = html;
    }
});
```
