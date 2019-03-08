var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //body-parser is a middleware
var _ = require('underscore');

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('TODO API Root');
});

//GET /todos
app.get('/todos', function(req, res) {
    res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10); //Important, data type must match
    var matchedTodo = _.findWhere(todos, {id: todoId}); //Underscore

    if(!matchedTodo){ //If not found
        res.status(404).send();
    }else{
        res.json(matchedTodo);
    }
});

// //POST
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if(!_.isBoolean(body.completed) 
        || !_.isString(body.description) 
        || body.description.trim().length === 0) { //  body.description.trim().length avoids strings with only spaces
        return res.status(400).send();
    }

    body.description = body.description.trim();

    //Add id field
    body.id = todoNextId++;

    //Push to array
    todos.push(body);

    res.json(body);
});

app.listen(PORT, function() {
    console.log('Express is listening on port: ' + PORT);
});