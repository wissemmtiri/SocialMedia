import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      "BANNER": "CREATING MY OWN VERSION OF SOCIAL MEDIA."
    };
  }
}
