import { Role } from '../../../domain/enums/role.enum';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };

  constructor(
    accessToken: string,
    user: { id: string; email: string; role: Role },
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
