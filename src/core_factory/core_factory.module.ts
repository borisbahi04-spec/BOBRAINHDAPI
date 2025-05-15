import { Module, OnApplicationBootstrap } from '@nestjs/common';
// Do this for dependencies import caution.
// find file relave path for dependencies import caution
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [],
  exports: [],
})
export class CoreFactoryModule implements OnApplicationBootstrap {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationBootstrap() {
    console.log(
      `*** [${CoreFactoryModule.name}][onApplicationBootstrap] start`,
    );
    /* const defaultDataService = this.moduleRef.get(DefaultDataService);
    defaultDataService
      .createDefaultData()
      .then((result) => {
        console.log(
          `*** [${CoreModule.name}][onApplicationBootstrap] default data created =>`,
          result,
        );
      })
      .catch((error) => {
        console.error(
          `*** [${CoreFactoryModule.name}][onApplicationBootstrap] default data creating failed`,
          error,
        );
      });*/
  }
}
