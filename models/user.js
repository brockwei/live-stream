'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    email: DataTypes.STRING,
    username: DataTypes.STRING,    
    password: DataTypes.STRING,
    facebookID:DataTypes.STRING,
    facebookDisplayName:DataTypes.STRING,
    googleID:DataTypes.STRING,
    googleDisplayName:DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        user.hasMany(models.relations,{foreignKey:'username',sourceKey:'username'});
        user.hasMany(models.messages,{foreignKey:'username',sourceKey:'username'});
      }
    }
  });
  return user;
};