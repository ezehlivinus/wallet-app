import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/users/users.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    const roles = this.reflector.getAllAndOverride<Roles[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    if (roles.length === 0) return true;

    return roles.includes(user.role);
  }
}
