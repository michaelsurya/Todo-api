var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //body-parser is a middleware
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('TODO API Root');
});

//GET /todos
app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var queryParams = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') { //Query for complete status
        where.completed = true;
    }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        where.completed = false;
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) { //Query for description
        where.description = {
            $like: '%' + queryParams.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(400).send();
    });

});

//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10); //Important, data type must match

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if(!!todo) {
            res.json(todo.toJSON());
        }else {
           res.status(404).send(); 
        }
	}, function(e) {
        res.status(500).send();
    });
});

//POST
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo) {
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        });
    }, function(e) {
        res.status(400).json(e);
    })
});

//DELETE
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(result) {
        if(result === 0) {
            res.status(404).json({
                error: 'No todo with that id'
            });
        }else{
            res.status(204).send();
        }
    }, function() { 
        res.status(500).send();
    });
});

//PUT
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var Attributes = {}
    var todoId = parseInt(req.params.id, 10);

    if(body.hasOwnProperty('completed')) {
        Attributes.completed = body.completed;
    }

    if(body.hasOwnProperty('description')) {
        Attributes.description = body.description
    }

    db.todo.findOne({
        where:{
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if(todo) {
            todo.update(Attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        }else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    })

});

//POST/users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    })
});

//POST/users/login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication')
        if(token){
            res.header('Auth', token).json(user.toPublicJSON())
        }else{
            res.status(401).send()
        }
        
    }, function() {
        res.status(401).send();
    })

});


//Sync the database
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Express is listening on port: ' + PORT);
    });
});