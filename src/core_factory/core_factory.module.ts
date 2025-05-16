import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Shift } from './entities/setting/shift.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultDataService } from './services/system/default-data.service';
import { Size } from './entities/setting/size.entity';
import { CashewStage } from './entities/setting/cashew-stage.entity';
import { Roaster } from './entities/roaster/roaster.entity';
import { Stack } from './entities/roaster/stack.entity';
import { RoasterToHumidityAfterCooking } from './entities/roaster/roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from './entities/roaster/roaster-to-humidity-after-cooling.entity';
import { RoasterToHumidityBeforeCooking } from './entities/roaster/roaster-to-humidity-before-cooking.entity';
import { RoasterToSetting } from './entities/roaster/roaster-to-setting.entity';
import { RoasterToSettingToCoocleaSpeed } from './entities/roaster/roaster-to-setting-to-coocleaspeed.entity';
import { CoocleaSpeed } from './entities/setting/cooclea-speed.entity';
import { CylinderTemperature } from './entities/setting/cylinder-temperature.entity';
import { RoasterToSettingToCylinderTemperature } from './entities/roaster/roaster-to-setting-to-cylindertemperature.entity copy';
import { RoasterToSettingToDirectSteam } from './entities/roaster/roaster-to-setting-to-directsteam.entity';
import { DirectSteam } from './entities/setting/direct-steam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shift,
      Size,
      CashewStage,
      Roaster,
      RoasterToHumidityBeforeCooking,
      RoasterToHumidityAfterCooking,
      RoasterToHumidityAfterCooling,
      RoasterToSetting,
      RoasterToSettingToCoocleaSpeed,
      CoocleaSpeed,
      RoasterToSettingToCylinderTemperature,
      CylinderTemperature,
      RoasterToSettingToDirectSteam,
      DirectSteam,
      Stack,
    ]),
  ],
  controllers: [],
  providers: [DefaultDataService],
  exports: [],
})
export class CoreFactoryModule implements OnApplicationBootstrap {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationBootstrap() {
    console.log(
      `*** [${CoreFactoryModule.name}][coreFactory onApplicationBootstrap] start`,
    );
    const defaultDataService = this.moduleRef.get(DefaultDataService);
    defaultDataService
      .createDefaultData()
      .then((result) => {
        console.log(
          `*** [${CoreFactoryModule.name}][onApplicationBootstrap] default data created =>`,
          result,
        );
      })
      .catch((error) => {
        console.error(
          `*** [${CoreFactoryModule.name}][onApplicationBootstrap] default data creating failed`,
          error,
        );
      });
  }
}
