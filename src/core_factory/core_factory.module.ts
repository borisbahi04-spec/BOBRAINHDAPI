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
import { Qashelling } from './entities/qashelling/qashelling.entity';
import { QashellingToPercentageOfKernel } from './entities/qashelling/qashelling-to-percentage-of-kernel.entity';
import { QashellingToPercentageOfUnscooped } from './entities/qashelling/qashelling-to-percentage-of-unscooped.entity';
import { QashellingToHumidity } from './entities/qashelling/qashelling-to-humidity.entity';
import { Line } from './entities/setting/line.entity';
import { QashellingOutputToKernel } from './entities/qashelling/qashelling-output-to-kernel.entity';
import { QashellingOutput } from './entities/qashelling/qashelling-output.entity';
import { QashellingToKernel } from './entities/qashelling/qashelling-to-kernel.entity';
import { QashellingOutputToNetCount } from './entities/qashelling/qashelling-output-to-netcount.entity';
import { QacycloneToKernel } from './entities/qacyclone/qacyclone-to-kernel.entity';
import { Qacyclone } from './entities/qacyclone/qacyclone.entity';
import { Qaimpactor } from './entities/qaimpactor/qaimpactor.entity';
import { QaimpactorToFirstOutput } from './entities/qaimpactor/qaimpactor-to-firstoutput.entity';
import { QaimpactorToSecondOutput } from './entities/qaimpactor/qaimpactor-to-second-output.entity';
import { QashellingOutputToLotNumber } from './entities/qashelling/qashelling-output-to-lotnumber.entity';
import { QaimpactorToShellingOutput } from './entities/qaimpactor/qaimpactor-to-shelling-output.entity';
import { QacycloneToShellingOutput } from './entities/qacyclone/qacyclone-to-shellingoutput.entity';
import { Qapeeling } from './entities/qapeeling/qapeeling.entity';
import { QapeelingToInputKernel } from './entities/qapeeling/qapeeling-to-input-kernel.entity';
import { QapeelingToTestaKernel } from './entities/qapeeling/qapeeling-to-testa-kernel.entity';
import { QapeelingToUnpeeledKernel } from './entities/qapeeling/qapeeling-to-unpeeled-kernel.entity';
import { QapeelingToPeeledKernel } from './entities/qapeeling/qapeeling-to-peeled-kernel.entity';
import { RoasterController } from './controllers/roaster/roaster.controller';
import { RoasterService } from './services/roaster/roaster.service';
import { RoasterSubscriber } from './services/roaster/roaster.subscriber';
import { ShiftController } from './controllers/settings/shift/shift.controller';
import { ShiftService } from './services/setting/shift/shift.service';
import { SizeService } from './services/setting/size/size.service';
import { SizeController } from './controllers/settings/size/size.controller';
import { StackService } from './services/stack/stack.service';
import { StackController } from './controllers/stack/stack.controller';
import { CoocleaSpeedService } from './services/setting/coocleaspeed/cooclea-speed.service';
import { CoocleaSpeedController } from './controllers/settings/coocleaspeed/cooclea-speed.controller';
import { CylinderTemperatureService } from './services/setting/cylindertemperature/cylinder-temperature.service';
import { CylinderTemperatureController } from './controllers/settings/cylindertemperature/cylinder-temperature.controller';
import { DirectSteamService } from './services/setting/directsteam/direct-steam.service';
import { DirectSteamController } from './controllers/settings/directsteam/direct-steam.controller';
import { CashewStageService } from './services/setting/cashewstage/cashew-stage.service';
import { CashewStageController } from './controllers/settings/cashewstage/cashew-stage.controller';

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
      Qashelling,
      QashellingToKernel,
      QashellingToPercentageOfKernel,
      QashellingToPercentageOfUnscooped,
      QashellingToHumidity,
      QashellingOutput,
      QashellingOutputToKernel,
      QashellingOutputToNetCount,
      QashellingOutputToLotNumber,
      Qacyclone,
      QacycloneToKernel,
      QacycloneToShellingOutput,
      Qaimpactor,
      QaimpactorToFirstOutput,
      QaimpactorToSecondOutput,
      QaimpactorToShellingOutput,
      Qapeeling,
      QapeelingToInputKernel,
      QapeelingToPeeledKernel,
      QapeelingToUnpeeledKernel,
      QapeelingToTestaKernel,
      Line,
    ]),
  ],
  controllers: [
    ShiftController,
    SizeController,
    CoocleaSpeedController,
    StackController,
    RoasterController,
    CylinderTemperatureController,
    DirectSteamController,
    CashewStageController,
  ],
  providers: [
    DefaultDataService,
    ShiftService,
    SizeService,
    StackService,
    CoocleaSpeedService,
    RoasterService,
    CylinderTemperatureService,
    DirectSteamService,
    CashewStageService,
    RoasterSubscriber,
  ],
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
