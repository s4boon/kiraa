import { DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

export const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.TEXT
  }
})

export const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactInfo: {
    type: DataTypes.STRING
  }
})

export const Booking = sequelize.define('Booking', {
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  pricing: {
    type: DataTypes.INTEGER
  },
  additionalInfo: {
    type: DataTypes.STRING
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tenantId: {
    type: DataTypes.UUID,
    allowNull: false
  }
})

Group.hasMany(Room, { foreignKey: 'groupId' })
Room.belongsTo(Group, { foreignKey: 'groupId' })
Room.hasMany(Booking, { foreignKey: 'roomId' })
Booking.belongsTo(Room, { foreignKey: 'roomId' })
Tenant.hasMany(Booking, { foreignKey: 'tenantId' })
Booking.belongsTo(Tenant, { foreignKey: 'tenantId' })
