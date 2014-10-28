var express = require("express"),
    swig = require('swig'),
    bodyParser = require("body-parser"),
    User = require("./users"),
    session = require('express-session'),
    app = express();

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/../views');

if(process.env['DEVELOPMENT']){
    app.set('view cache', false);
    swig.setDefaults({ cache: false });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: 'keyboard cat'}));
app.use(function(req, res, next){
    res.error = function(code, msg){
        return res.status(code).json({
            code : code,
            message : msg,
            status : "fail"
        });
    };
    if(req.session['username']){
        User.find(req.session.username, function(user){
            if(user){
                req.user = user;
                res.locals.user = user;
            }
            next();
        });
    } else{
        next();
    }
});

app.require_login = function(req, res, next){
    if(!req.user){
        return res.error(401, "Login required");
    }
    next();
};

app.get("/", function(req, res){
    return res.render("index");
});

/* webapp functions */

app.get("/app/login", function(req, res){
    return res.render("login");
});

app.get("/app", app.require_login, function(req, res){
    return res.render("dashboard");
});

app.get("/app/apps/:id", app.require_login, function(req, res){
    if(req.params.id == "new"){
        return res.render("app", { new : true });
    } else{
        return res.render("app", { /* todo */ });
    }
});

/*
auth

auth uses sessions rather than oauth tokens because
you really shouldn't be spending a lot of time inside of this
system
*/

app.post("/app/login", function(req, res){
    if( !req.body['username'] || !req.body['password'] || !req.body['2fa'] ){
        return res.error(400, "username, password and 2fa key required!");
    }
    User.find(req.body['username'], function(user){
        if(!user){ return res.error(401, "User not found"); }

        user.checkPassword(req.body['password'], req.body['2fa'], function(ok){
            if(!ok){ return res.error(401, "Password/2FA incorrect"); }

            req.session.username = user.username;
            if(req.body['type'] == "webapp"){
                return res.redirect("/app");
            }

            return res.json({
                status : "ok",
                session : req.sessionID
            });

        });
    });
});

var port = 9000;
console.log("deploycat: http://localhost:" + port);
app.listen(port);
