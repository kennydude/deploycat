var prompt = require("prompt"),
    User = require("./users");

console.log("*** Setup deploycat ***");
console.log("");
console.log("Stage 1: Setup first user");

prompt.colors = false;
prompt.message = "> ";
prompt.delimiter = "";

var schema = {
    properties : {
        username : {
            description : "Username: ",
            required : true
        },
        password : {
            description : "Password:",
            hidden : true,
            required : true
        }
    }
};

prompt.start();
prompt.get(schema, function (err, result) {
    var u = new User();
    u.username = result.username;
    u.password = result.password;
    u.role = "admin";

    u.save(function(){
        // TODO: 2FA!!!!
        console.log("Could be done. This is a WIP");
    });
});
