import { Controller, Get, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtGard } from 'src/auth/guard';

@UseGuards(JwtGard)
@Controller('Home')
export class HomeController {
    @Get()
    home(@Req() req : any) {
        console.log({homereq : req.user});
        console.log({homecookies : req.cookies});
        return 'Welcome Home!';
    }
}
