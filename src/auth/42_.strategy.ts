import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback} from "passport-42";
import { AuthService } from "./auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: "u-s4t2ud-397cfbf70bcb8d4e3d34dd3e443770a07a3a898a8c3fe1d1840713b9af0e9fe1",
            clientSecret: "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",
            callbackURL: "http://localhost:3000/auth/callback",
            scope: 'public'
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, _json } = profile

        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: _json.image.link,
            username: profile.username,
            accessToken
        }
        done(null, user);
    }

}