var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //body-parser is a middleware
var _ = require('underscore');
var db = require('./db.js');

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

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') { //Query for complete status
        filteredTodos = _.where(filteredTodos, {completed: true});
    }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) { //Query for description
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q) > -1; //Make sure query is not case sensitive
        });
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

    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function(e) {
        res.status(400).json(e);
    })
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

//Sync the database
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Express is listening on port: ' + PORT);
    });
});