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
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }

    res.json(filteredTodos);
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

//POST
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

//DELETE
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    
    if(!matchedTodo){ //If not found
        res.status(404).json({"error": "No todo found with that id"});
    }else{
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

//PUT
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {}
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    //Validation
    if(!matchedTodo){ //If not found
        return res.status(404).json({"error": "No todo found with that id"});
    }
    
    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    }else if(body.hasOwnProperty('completed')) {
        //Bad
        return res.status(400).send();
    }

    if(body.hasOwnProperty('description') && body.description.trim().length > 0 && _.isString(body.description)) {
        validAttributes.description = body.description
    }else if(body.hasOwnProperty('description')) {
        //Bad
        return res.status(400).send();
    }
    //End of validation

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});


app.listen(PORT, function() {
    console.log('Express is listening on port: ' + PORT);
});