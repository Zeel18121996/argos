import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { UserModel } from '../users/models/user.model'
import { RefreshTokenModel } from '../auth/models/refresh-token.model'
import { OrderModel } from '../orders/models/order.model'
import { ProductModel } from '../products/models/product.model'
import { CategoryModel } from '../categories/models/category.model'
import { QueryUsersDto, UserStatusFilter } from './dto/query-users.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { buildMeta } from '../common/dto/paginated-response.dto'
import type { JwtUser } from '../auth/types/jwt-user.type'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(RefreshTokenModel) private readonly refreshTokenModel: typeof RefreshTokenModel,
    @InjectModel(OrderModel) private readonly orderModel: typeof OrderModel,
    @InjectModel(ProductModel) private readonly productModel: typeof ProductModel,
    @InjectModel(CategoryModel) private readonly categoryModel: typeof CategoryModel,
  ) {}

  async listUsers(query: QueryUsersDto) {
    const { page = 1, limit = 30, q, role, status } = query

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (role) where.role = role
    if (status) where.isActive = status === UserStatusFilter.active
    if (q) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${q}%` } },
        { firstName: { [Op.iLike]: `%${q}%` } },
        { lastName: { [Op.iLike]: `%${q}%` } },
      ]
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    })

    return {
      data: rows.map((u) => this.toAdminSummary(u)),
      meta: buildMeta(page, limit, count),
    }
  }

  async getUser(id: string) {
    const user = await this.userModel.findByPk(id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return this.toAdminSummary(user)
  }

  async updateRole(id: string, dto: UpdateUserRoleDto, actor: JwtUser) {
    if (actor.id === id) {
      throw new ForbiddenException('You cannot change your own role')
    }
    const user = await this.userModel.findByPk(id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    user.role = dto.role
    await user.save()
    // Force re-login on role change by revoking all refresh tokens.
    await this.refreshTokenModel.update(
      { revoked: true },
      { where: { userId: user.id, revoked: false } },
    )
    return this.toAdminSummary(user)
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, actor: JwtUser) {
    if (actor.id === id) {
      throw new ForbiddenException('You cannot deactivate your own account')
    }
    const user = await this.userModel.findByPk(id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    user.isActive = dto.isActive
    await user.save()
    if (!dto.isActive) {
      // Revoke all refresh tokens so they can't keep using their session.
      await this.refreshTokenModel.update(
        { revoked: true },
        { where: { userId: user.id, revoked: false } },
      )
    }
    return this.toAdminSummary(user)
  }

  async listCategories() {
    const all = await this.categoryModel.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
      raw: true,
    })
    return { data: all }
  }

  async getDashboardStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayOrders = await this.orderModel.count({
      where: { createdAt: { [Op.gte]: todayStart } },
    })

    const todayRevenue =
      (await this.orderModel.sum('total', {
        where: { createdAt: { [Op.gte]: todayStart }, status: { [Op.ne]: 'cancelled' } },
      })) ?? 0

    const totalProducts = await this.productModel.count({ where: { isActive: true } })
    const totalCustomers = await this.userModel.count({ where: { role: 'customer' } })

    const recentOrders = await this.orderModel.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
    })

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue),
      totalProducts,
      totalCustomers,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
      })),
    }
  }

  private toAdminSummary(user: UserModel) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }
  }
}
