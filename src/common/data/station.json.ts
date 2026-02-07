import { CreateStationDto } from '../../core/dto/station/create-station.dto';

// Default users
export const getDefaultStations = () => {
  return <CreateStationDto[]>[
    {
      displayName: 'CL0-AYANOUAN',
      description: 'CL0 AYANOUAN',
      isActive: true,
    },
    {
      displayName: 'CL1-EBOUE',
      description: 'CL1 EBOUE',
      isActive: true,
    },
    {
      displayName: 'CL2-ALLAKRO',
      description: 'CL2 ALLAKRO',
      isActive: true,
    },
    {
      displayName: 'CL3-ADIAKE',
      description: 'CL3 ADIAKE',
      isActive: true,
    },
    {
      displayName: 'CL4-ETUOBOUE',
      description: 'CL4 ETUOBOUE',
      isActive: true,
    },
    {
      displayName: 'CL6 JERUSALEM',
      description: 'CL6 JERUSALEM',
      isActive: true,
    },
    {
      displayName: 'CL8 MALAMALAKRO',
      description: 'CL8 MALAMALAKRO',
      isActive: true,
    },
    {
      displayName: 'CL9 KOTOAGNUAN',
      description: 'CL9 KOTOAGNUAN',
      isActive: true,
    },
  ];
};
