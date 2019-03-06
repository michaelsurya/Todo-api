var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Do something',
    completed: false,
}, {
    id: 2,
    description: 'Do something 2',
    completed: false
}, {
    id: 3,
    description: 'Do something 3',
    completed: false
}];

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

app.listen(PORT, function() {
    console.log('Express is listening on port: ' + PORT);
});