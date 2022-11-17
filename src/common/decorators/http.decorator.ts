import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Roles } from 'src/users/users.dto';
import { ErrorResponseDTO } from '../dtos/response.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(roles: Roles[] = []): MethodDecorator {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('roles', roles),
    UseGuards(RolesGuard),
    ApiBadRequestResponse({
      description: 'Bad request',
      type: ErrorResponseDTO
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorResponseDTO
    }),
    ApiForbiddenResponse({ description: 'forbidden', type: ErrorResponseDTO }),
    ApiBearerAuth()
  );
}
