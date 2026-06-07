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

interface TenantModel extends Model<
  InferAttributes<TenantModel>,
  InferCreationAttributes<TenantModel>
> {
  id: CreationOptional<string>
  name: string
  contactInfo: CreationOptional<string | null>

  Bookings?: NonAttribute<BookingModel[]>
}

interface BookingModel extends Model<
  InferAttributes<BookingModel>,
  InferCreationAttributes<BookingModel>
> {
  id: CreationOptional<number>

  startDate: Date
  endDate: Date

  pricing: CreationOptional<number | null>
  status: CreationOptional<'booked' | 'confirmed'>
  additionalInfo: CreationOptional<string | null>

  roomId: number
  tenantId: string

  Room?: NonAttribute<RoomModel>
  Tenant?: NonAttribute<TenantModel>
}

export type GroupModelType = Attributes<GroupModel>
export type RoomModelType = Attributes<RoomModel>
export type TenantModelType = Attributes<TenantModel>
export type BookingModelType = Attributes<BookingModel>
