import { IsIn } from 'class-validator'
import type { UserRole } from '../../users/models/user.model'

export class UpdateUserRoleDto {
  @IsIn(['customer', 'staff', 'admin'] as UserRole[])
  role!: UserRole
}
