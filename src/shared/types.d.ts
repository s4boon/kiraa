import {
  Attributes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute
} from 'sequelize'

interface GroupModel extends Model<
  InferAttributes<GroupModel>,
  InferCreationAttributes<GroupModel>
> {
  id: CreationOptional<number>
  name: string

  Rooms?: NonAttribute<RoomModel[]>
}

interface RoomModel extends Model<InferAttributes<RoomModel>, InferCreationAttributes<RoomModel>> {
  id: CreationOptional<number>
  name: string
  capacity: string | null
  groupId: number

  Group?: NonAttribute<GroupModel>
  Bookings?: NonAttribute<BookingModel[]>
}

interface BookingModel extends Model<
  InferAttributes<BookingModel>,
  InferCreationAttributes<BookingModel>
> {
  id: CreationOptional<number>

  startDate: Date
  endDate: Date

  tenant: string
  contact: string
  total: CreationOptional<number | null>
  paid: CreationOptional<number | null>
  additionalInfo: CreationOptional<string | null>

  roomId: number
  Room?: NonAttribute<RoomModel>
}

export type GroupModelType = Attributes<GroupModel>
export type RoomModelType = Attributes<RoomModel>
export type BookingModelType = Attributes<BookingModel>
