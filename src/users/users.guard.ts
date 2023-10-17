import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = await this.extractToken(request);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.SECRET_KEY
        }
      )
      const user = await this.userRepository.findOne({ where: { username: payload["username"] } });
      if (!user) {
        throw new UnauthorizedException();
      }

      if (user && (user.token !== token)) {
        throw new UnauthorizedException();
      }
      request['user'] = payload["username"];
      request['role'] = payload["role"];
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  async extractToken(request: Request): Promise<string | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}