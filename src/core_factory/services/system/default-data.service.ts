import { Injectable } from '@nestjs/common';
import { Shift } from 'src/core_factory/entities/setting/shift.entity';
import { getDefaultShifts } from 'src/common/data/shift.json';
import { getDefaultSizes } from 'src/common/data/size.json';
import { Size } from 'src/core_factory/entities/setting/size.entity';
import { CashewStage } from 'src/core_factory/entities/setting/cashew-stage.entity';
import { getDefaultCashewStages } from 'src/common/data/cashew-stage.json';
import { getDefaultCoocleaSpeeds } from 'src/common/data/coocleaspeed.json';
import { CoocleaSpeed } from 'src/core_factory/entities/setting/cooclea-speed.entity';
import { CylinderTemperature } from 'src/core_factory/entities/setting/cylinder-temperature.entity';
import { getDefaultCylinderTemperatures } from 'src/common/data/cylindertemperature.json';
import { DirectSteam } from 'src/core_factory/entities/setting/direct-steam.entity';
import { getDefaultDirectSteams } from 'src/common/data/directsteam.json';

@Injectable()
export class DefaultDataService {
  async createDefaultData() {
    const shifts = await this.createShiftsDefaultData();
    const sizes = await this.createSizesDefaultData();
    const cashewStages = await this.createCashewStagesDefaultData();
    const coocleaSpeeds = await this.createCoocleaSpeedsDefaultData();
    const cylinderTemperatures =
      await this.createCylinderTemperaturesDefaultData();
    const directSteams = await this.createDirectSteamsDefaultData();

    return {
      shifts: shifts.length,
      sizes: sizes.length,
      cashewStages: cashewStages.length,
      coocleaSpeeds: coocleaSpeeds.length,
      cylinderTemperatures: cylinderTemperatures.length,
      directSteams: directSteams.length,
    };
  }

  async createShiftsDefaultData(): Promise<Shift[]> {
    const defaultShifts = getDefaultShifts();
    const shifts: Shift[] = [];
    let exists: number;
    for (const dto of defaultShifts) {
      exists = await Shift.countBy({ value: dto.value });
      if (exists <= 0) {
        shifts.push(await Shift.save(dto as Shift));
      }
    }
    return shifts;
  }

  async createCoocleaSpeedsDefaultData(): Promise<CoocleaSpeed[]> {
    const defaultCoocleaSpeeds = getDefaultCoocleaSpeeds();
    const coocleaSpeeds: CoocleaSpeed[] = [];
    let exists: number;
    for (const dto of defaultCoocleaSpeeds) {
      exists = await CoocleaSpeed.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        coocleaSpeeds.push(await CoocleaSpeed.save(dto as CoocleaSpeed));
      }
    }
    return coocleaSpeeds;
  }

  async createCylinderTemperaturesDefaultData(): Promise<
    CylinderTemperature[]
  > {
    const defaultCylinderTemperatures = getDefaultCylinderTemperatures();
    const cylinderTemperatures: CylinderTemperature[] = [];
    let exists: number;
    for (const dto of defaultCylinderTemperatures) {
      exists = await CylinderTemperature.countBy({
        displayName: dto.displayName,
      });
      if (exists <= 0) {
        cylinderTemperatures.push(
          await CylinderTemperature.save(dto as CylinderTemperature),
        );
      }
    }
    return cylinderTemperatures;
  }

  async createDirectSteamsDefaultData(): Promise<DirectSteam[]> {
    const defaultdirectSteamss = getDefaultDirectSteams();
    const directSteams: DirectSteam[] = [];
    let exists: number;
    for (const dto of defaultdirectSteamss) {
      exists = await DirectSteam.countBy({
        displayName: dto.displayName,
      });
      if (exists <= 0) {
        directSteams.push(await DirectSteam.save(dto as DirectSteam));
      }
    }
    return directSteams;
  }

  async createSizesDefaultData(): Promise<Size[]> {
    const defaultSizes = getDefaultSizes();
    const sizes: Size[] = [];
    let exists: number;
    for (const dto of defaultSizes) {
      exists = await Size.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        sizes.push(await Size.save(dto as Size));
      }
    }
    return sizes;
  }

  async createCashewStagesDefaultData(): Promise<CashewStage[]> {
    const defaultCashewStages = getDefaultCashewStages();
    const cashewStages: CashewStage[] = [];
    let exists: number;
    for (const dto of defaultCashewStages) {
      exists = await CashewStage.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        cashewStages.push(await CashewStage.save(dto as CashewStage));
      }
    }
    return cashewStages;
  }
}
