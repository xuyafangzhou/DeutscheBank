const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken');

const Schema = mongoose.Schema
const salt=10;

const User = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: {type: String, required: true},
        events:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
        token: {type: String}
    },
    { timestamps: true },
)

User.pre('save',function(next){ // Handles hashing of password, will be executed before .save()
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

User.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

User.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),"thisisecret"); // TODO: Retrieve secret from config file (shouldn't be hardcoded)

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

User.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,"thisisecret",function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

User.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

module.exports = mongoose.model('users', User)