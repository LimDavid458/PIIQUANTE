const bcrypt = require('bcrypt'); // Package for password encryption
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Package for Token encoding


exports.signup =  (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Password encryption
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'utilisateur crée!'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}

exports.login =  (req, res, next) => {
    User.findOne({ email: req.body.email})
    .then(user => {
        if (user === null) {
            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte'});
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte'});
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(        // Token encoding
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h'}
                        ),
                    });
                }
            })
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error => res.status(500).json({ error }));
}