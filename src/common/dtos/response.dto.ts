import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDTO {
  @ApiProperty()
  status: string;

  @ApiProperty()
  error: string;

  @ApiProperty({ type: String, isArray: true })
  errors: string[];
}
