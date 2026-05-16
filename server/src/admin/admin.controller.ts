import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { QueryUsersDto } from './dto/query-users.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { JwtUser } from '../auth/types/jwt-user.type'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Staff or above can list/view users
  @Get('users')
  listUsers(@Query() query: QueryUsersDto) {
    return this.adminService.listUsers(query)
  }

  @Get('users/:id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUser(id)
  }

  // Only admins can change role
  @Patch('users/:id/role')
  @Roles('admin')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.adminService.updateRole(id, dto, actor)
  }

  // Staff can activate/deactivate
  @Patch('users/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.adminService.updateStatus(id, dto, actor)
  }
}
