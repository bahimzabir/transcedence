import { Controller, Get } from '@nestjs/common';

@Controller('img')
export class ImgController {
    constructor(){}

    @Get("images")
    getimages() {
        
    }
}
