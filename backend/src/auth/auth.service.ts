import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Vérifie email + mot de passe et renvoie un JWT + l'utilisateur (sans le hash).
   * Le même message d'erreur est renvoyé que l'email n'existe pas ou que le mot
   * de passe soit faux, pour ne pas révéler quels comptes existent.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { hopital: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const motDePasseValide = await argon2.verify(
      user.motDePasseHash,
      dto.motDePasse,
    );
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      hopitalId: user.hopitalId,
    };
    const accessToken = await this.jwt.signAsync(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { motDePasseHash, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }
}
