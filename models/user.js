'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    email: DataTypes.STRING,
    displayNameforLocalLogin: DataTypes.STRING,    
    password: DataTypes.STRING,
    facebookID:DataTypes.STRING,
    facebookDisplayName:DataTypes.STRING,
    googleID:DataTypes.STRING,
    googleDisplayName:DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return user;
};