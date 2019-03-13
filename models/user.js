module.exports = function (sequlize, DataTypes) {
    return sequlize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 25]
                
            }
        }
    }, {
        hooks: {
            beforeValidate: (user, options) => {
                if(typeof user.email === 'string'){
                    user.email = user.email.toLowerCase()
                }
            }
        }
    })
}