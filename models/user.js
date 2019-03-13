var bcrypt = require('bcrypt');
var _ = require('underscore');

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
            }
        },
        //NOT RETURNING PASSWORD AS RESPONSE
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON()
                return _.pick(this, 'id', 'email', 'createdAt', 'updatedAt')
            }
        }
    })
    return user
}