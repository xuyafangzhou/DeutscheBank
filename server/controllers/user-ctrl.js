const User = require('../models/User')

login = (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user)=>{
        if (err) return res.status(400).json({error: err})
        if (user) return res.status(400).json({error: "You are already logged in"})
        
        User.findOne({'email':req.body.email}, (err,user)=>{
            if(!user) return res.status(400).json({isAuth : false, error : "This email address does not exist. Please sign up."});
    
            user.comparepassword(req.body.password,(err,isMatch)=>{
                if(!isMatch) return res.status(400).json({ isAuth : false,error : "Incorrect password"});
                
                // Login success
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.status(200).cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                    });
                });    
            });
        });
    });
}

logout = (req, res) => {
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });
}

createUser = (req, res) => {
    const body = req.body
    if (!body) {
        return res.status(400).json({
            success: false,
            error: "You must provide data"
        })
    }
    const user = new User(body)
    if (!user) {
        return res.status(400).json({
            success: false,
            error: "Failed to create user"
        })
    }
    user
        .save()
        .then(()=>{
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.status(201).cookie('auth',user.token).json({ // Log user in after sign up
                    isAuth : true,
                    message: 'User created',
                    id : user._id
                });
            });
         })
         .catch(error=>{
             return res.status(400).json({
                success: false,
                error:'User creation failed'
             })
         })
}

module.exports = {
    login,
    logout,
    createUser
}