var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function (sequlize, DataTypes) {
    var user = sequlize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 25]
                
            },
            //START OF HASHING
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPasword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value)
                this.setDataValue('salt', salt)
                this.setDataValue('password_hash', hashedPasword)
            }
            //END OF HASHING
        }
    }, {
        hooks: {
            beforeValidate: (user, options) => {
                if(typeof user.email === 'string'){
                    user.email = user.email.toLowerCase()
                }
            }
        },
        classMethods: {
            //Authentication
            authenticate: function(body) {
                return new Promise(function (resolve, reject) {
                    if(!_.isString(body.email) || !_.isString(body.password)) {
                        reject()
                    }
                
                    user.findOne({
                        where: {
                            email: body.email,
                        }
                    }).then((user) => {
                        //User error or password mismatch
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                            return reject()
                        }
                        resolve(user);
                    }, function (e) {
                        reject()
                    })
                })
            },
            findByToken: function (token) {
                return new Promise(function (resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, 'qwerty098')
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!')
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8))

                        user.findById(tokenData.id).then(function (user) {
                            if(user){
                                resolve(user);
                            }else{
                                reject();
                            }
                        }, function (e) {
                            reject();
                        })
                    } catch (e) {
                        reject();
                    }
                })
            }
        },
        //NOT RETURNING PASSWORD AS RESPONSE
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON()
                return _.pick(this, 'id', 'email', 'createdAt', 'updatedAt')
            },
            generateToken: function (type) {
                if(!_.isString(type)){
                    return undefined;
                }
                
                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type})
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString()
                    var token = jwt.sign({
                        token: encryptedData,
                    }, 'qwerty098')
                    
                    return token
                } catch (e) {
                    console.error(e)
                    return undefined
                }
            }
        },

    })
    return user
}