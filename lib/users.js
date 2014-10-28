var fs = require("fs"),
    path = require("path"),
    notp = require('notp'),
    bcrypt = require("bcryptjs");

function User(){
    // todo
    Object.defineProperty(this, "password", {
        get : function(){
            console.warn("(!) User.password usually isn't accessed this way! [see checkPassword]");
            return this._password;
        },
        set : function(value){
            this._password = bcrypt.hashSync(value);
        }
    });
}

module.exports = User;

User.find = function(username, cb){
    fs.readFile(
        path.join(__dirname, "..", "data", "user-" + username + ".json"),
        function(err, result){
            if(err){ cb(null); }
            try{
                var u = JSON.parse(result);
                var user = new User();
                user.username = u.username;
                user._password = u.password;
                user.otp = u.otp;
                user.role = u.role;
                cb(user);
            } catch(e){
                cb(null);
            }
        }
    );
}

User.prototype.checkPassword = function(check, tfa, cb){
    var self = this;
    bcrypt.compare(check, this._password, function(err, res) {
        if(!res) return cb(false);
        var otp = notp.totp.verify(tfa, self.otp);
        cb( otp );
    });
}

User.prototype.toJSON = function(){
    return {
        username : this.username,
        password : this._password,
        role : this.role,
        otp : this.otp
    };
};

User.prototype.save = function(cb){
    fs.writeFile(
        path.join(__dirname, "..", "data", "user-" + this.username + ".json"),
        JSON.stringify(this.toJSON()),
        cb
    )
};
