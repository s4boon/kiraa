import {
  Attributes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model
} from 'sequelize'

interface GroupModel extends Model<
  InferAttributes<GroupModel>,
  InferCreationAttributes<GroupModel>
> {
  id: CreationOptional<number>
  name: string
}

interface RoomModel extends Model<InferAttributes<RoomModel>, InferCreationAttributes<RoomModel>> {
  id: CreationOptional<number>
  name: string
  capacity: string
  groupId: number
}

interface TenantModel extends Model<
  InferAttributes<TenantModel>,
  InferCreationAttributes<TenantModel>
> {
  id: CreationOptional<string>
  name: string
  contactInfo: CreationOptional<string>
}

interface BookingModel extends Model<
  InferAttributes<BookingModel>,
  InferCreationAttributes<BookingModel>
> {
  id: CreationOptional<number>
  startDate: Date
  endDate: Date
  pricing: CreationOptional<number>
  status: CreationOptional<'booked' | 'confirmed'>
  additionalInfo: CreationOptional<string>
  roomId: number
  tenantId: string
}

export type GroupModelType = Attributes<GroupModel>
export type RoomModelType = Attributes<RoomModel>
export type TenantModelType = Attributes<TenantModel>
export type BookingModelType = Attributes<BookingModel>
