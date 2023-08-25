import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        'u-s4t2ud-a22e45f954a80608fcb0d66983ed3e9886889603e74b29af4d9379ee446d3a0f',
      clientSecret:
        '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',
      callbackURL: 'http://localhost:3000/auth/callback',
      scope: 'public',
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, _json } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: _json.image.link,
      username: profile.username,
      accessToken,
    };
    done(null, user);
  }
}
