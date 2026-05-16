import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { Request } from 'express'
import { OrdersService } from './orders.service'
import { QueryOrderDto, AdminQueryOrderDto, UpdateOrderStatusDto } from './dto/order.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Public } from '../common/decorators/public.decorator'

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** Admin: list all orders */
  @Get('admin/orders')
  @Roles('staff', 'admin')
  async findAll(@Query() query: AdminQueryOrderDto) {
    return this.ordersService.findAll(query)
  }

  /** Admin: update order status */
  @Patch('admin/:id/status')
  @Roles('staff', 'admin')
  async updateStatus(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto)
  }

  /** Public order tracking (no auth) */
  @Get('track')
  @Public()
  async track(@Query('orderNumber') orderNumber: string, @Query('postcode') postcode: string) {
    return this.ordersService.track(orderNumber, postcode)
  }

  /** List current user's orders */
  @Get()
  @Roles('customer', 'staff', 'admin')
  findUserOrders(@Req() req: Request, @Query() query: QueryOrderDto) {
    const userId = (req as any).user.id
    return this.ordersService.findUserOrders(userId, query)
  }

  /** Get single order detail (own or admin) */
  @Get(':id')
  @Roles('customer', 'staff', 'admin')
  async findOne(@Param('id', ParseUUIDPipe) orderId: string, @Req() req: Request) {
    const user = (req as any).user
    const isAdmin = user.role === 'admin' || user.role === 'staff'
    return this.ordersService.findOne(orderId, isAdmin ? undefined : user.id)
  }

  /** Cancel own order (before processing) */
  @Patch(':id/cancel')
  @Roles('customer', 'staff', 'admin')
  async cancel(@Param('id', ParseUUIDPipe) orderId: string, @Req() req: Request) {
    const user = (req as any).user
    const isAdmin = user.role === 'admin' || user.role === 'staff'
    return this.ordersService.cancel(orderId, isAdmin ? undefined : user.id)
  }
}
