'use strict';
module.exports = (sequelize, DataTypes) => {
  var relations = sequelize.define('relations', {
    username: DataTypes.STRING,
    friend: DataTypes.STRING,
    status: DataTypes.STRING
  });
    relations.associate = function(models) {
        // associations can be defined here
        relations.belongsTo(models.user,{foreignKey:'username',sourceKey:'username'});
    };
  return relations;
};
