import { BookingModel, GroupModel, RoomModel, TenantModel } from '@shared/types'
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

export const Tenant = sequelize.define<TenantModel>('Tenant', {
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
  pricing: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.ENUM('booked', 'confirmed'),
    defaultValue: 'booked'
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
Room.belongsTo(Group, { foreignKey: 'groupId', onDelete: 'CASCADE' })
Room.hasMany(Booking, { foreignKey: 'roomId' })
Booking.belongsTo(Room, { foreignKey: 'roomId', onDelete: 'CASCADE' })
Tenant.hasMany(Booking, { foreignKey: 'tenantId' })
Booking.belongsTo(Tenant, { foreignKey: 'tenantId', onDelete: 'CASCADE' })
