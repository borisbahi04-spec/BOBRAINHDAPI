import { CylinderTemperatureEnum } from 'src/core_factory/definitions/enums';
import { CreateCylinderTemperatureDto } from 'src/core_factory/dto/setting/cylindertemperature/create-cylinder-temperature.dto';

// Default users
export const getDefaultCylinderTemperatures = () => {
  return <CreateCylinderTemperatureDto[]>[
    {
      displayName: CylinderTemperatureEnum.C1CYLINDERTEMPERATURE,
    },
    {
      displayName: CylinderTemperatureEnum.C2CYLINDERTEMPERATURE,
    },
    {
      displayName: CylinderTemperatureEnum.C3CYLINDERTEMPERATURE,
    },
    {
      displayName: CylinderTemperatureEnum.C4CYLINDERTEMPERATURE,
    },
  ];
};
