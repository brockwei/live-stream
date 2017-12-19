'use strict';
module.exports = (sequelize, DataTypes) => {
  var messages = sequelize.define('messages', {
    username: DataTypes.STRING,
    friend: DataTypes.STRING,
    message: DataTypes.STRING,
    type:  DataTypes.STRING
  });
    messages.associate = function(models) {
        // associations can be defined here
        messages.belongsTo(models.user,{foreignKey:'username',sourceKey:'username'});
    };
  return messages;
};
