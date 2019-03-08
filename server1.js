var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //body-parser is a middleware


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
    var matchedTodo;
    
    todos.forEach(function(todo) {
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });

    if(!matchedTodo){ //If not found
        res.status(404).send();
    }else{
        res.json(matchedTodo);
    }
});

// //POST
app.post('/todos', function(req, res) {
    var body = req.body;

    //Add id field
    body.id = todoNextId;
    todoNextId++;

    //Push to array
    todos.push(body);

    res.json(body);
});

app.listen(PORT, function() {
    console.log('Express is listening on port: ' + PORT);
});