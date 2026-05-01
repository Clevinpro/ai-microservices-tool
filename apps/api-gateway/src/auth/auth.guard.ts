import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AuthenticatedRequest = {
  cookies?: Record<string, string | undefined>;
  user?: unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    try {
      request.user = this.jwtService.verify(accessToken);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

export { JwtAuthGuard as AuthGuard };
