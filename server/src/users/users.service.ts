import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserModel } from './models/user.model'
import { AddressModel } from './models/address.model'
import { UpdateMeDto } from './dto/update-me.dto'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(AddressModel) private readonly addressModel: typeof AddressModel,
  ) {}

  // ── User lookups ──────────────────────────────────────────────────────────
  async findById(id: string): Promise<UserModel> {
    const user = await this.userModel.findByPk(id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  /** Find by email (lowercase normalised). Returns null if missing. */
  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ where: { email: email.toLowerCase() } })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.count({ where: { email: email.toLowerCase() } })
    return count > 0
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserModel> {
    await this.findById(userId)
    await this.userModel.update(dto, { where: { id: userId } })
    return this.findById(userId)
  }

  // ── Addresses ─────────────────────────────────────────────────────────────
  async listAddresses(userId: string): Promise<AddressModel[]> {
    return this.addressModel.findAll({
      where: { userId },
      order: [
        ['is_default', 'DESC'],
        ['created_at', 'DESC'],
      ],
    })
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressModel> {
    // If the new address is default, unset is_default on any other addresses for this user.
    if (dto.isDefault) {
      await this.addressModel.update({ isDefault: false }, { where: { userId } })
    }
    return this.addressModel.create({ ...dto, userId } as Partial<AddressModel>)
  }

  async findAddress(userId: string, addressId: string): Promise<AddressModel> {
    const addr = await this.addressModel.findOne({ where: { id: addressId, userId } })
    if (!addr) throw new NotFoundException(`Address ${addressId} not found`)
    return addr
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressModel> {
    await this.findAddress(userId, addressId)
    if (dto.isDefault) {
      await this.addressModel.update({ isDefault: false }, { where: { userId } })
    }
    await this.addressModel.update(dto, { where: { id: addressId, userId } })
    return this.findAddress(userId, addressId)
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    await this.findAddress(userId, addressId)
    await this.addressModel.destroy({ where: { id: addressId, userId } })
  }
}
