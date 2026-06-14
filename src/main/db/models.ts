import { BookingModel, GroupModel, RoomModel } from '@shared/types'
import { DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export const Group = sequelize.define<GroupModel>('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
})

export const Room = sequelize.define<RoomModel>('Room', {
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
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
})

export const Booking = sequelize.define<BookingModel>('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tenant: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING
  },
  total: {
    type: DataTypes.INTEGER
  },
  paid: {
    type: DataTypes.INTEGER
  },

  additionalInfo: {
    type: DataTypes.STRING
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
})

Group.hasMany(Room, { foreignKey: 'groupId' })
Room.belongsTo(Group, { foreignKey: 'groupId', onDelete: 'CASCADE' })
Room.hasMany(Booking, { foreignKey: 'roomId' })
Booking.belongsTo(Room, { foreignKey: 'roomId', onDelete: 'CASCADE' })
