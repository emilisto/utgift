# Utgift

Keep track of your expenses - import, categorize and summarize easily.

Written as a single-page HTML5 web app with a node.js backend. Uses
mongodb for storage, Twitter Bootstrap and LESS for styling, backbone.js
for MVC in the client. Communication is done through socket.io. All very
trendy. Very trendy indeed.

[![Screenshot of Utgift](https://github.com/emilisto/utgift/raw/master/github/ss-small.png)](https://github.com/emilisto/utgift/raw/master/github/ss.png)

I created this to get to play with all the tools, but it might turn into
something actually useful.

## Setup
Edit `public/js/config.js` and enter your hostname of choice, then start
it by issuing `node app.js` and then connect to it.

* TODO: make the configuration more straight forward and allow one to
  specify the listening port explicitly.

The backend just expects a mongo server to be running and
accessible from localhost.

## What's coming
* I want to make the **Add batch** feature smarter and let the user instruct
the program how to interpret the different fields.

* Some machine learning algorithm should be applied to automatically
categorize expenses.

* Use some graphing JS library to show stats of ones expenses for each category. This is partly
  implemented in the `AggregatedView`/`AggregatedCollection`.


## Credits

* Emil Stenqvist, @emilisto

## Todo
* Clean up the search / filter mechanisms; unify them. Right now the `IndexedCollection` was 
  an approach I came up with after struggling with bad performance. The search was then added
  afterwards and is implemented more in the view. I want to implement search as well as filtering
  in the `FilteredCollection`.
* Go from categories to tags - that can be assigned in multiples to one expense
* Make server push changes to all clients in realtime. Thanks to the
  architecture this is a very minor addition.
* Provide a RESTful interface in the backend, and instead make socket.io
  communicate with this for the real-time updates. This way more apps
  can be created to communicate with Utgift. E.g. a mobile app.
