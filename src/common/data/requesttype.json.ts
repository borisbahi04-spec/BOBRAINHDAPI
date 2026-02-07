import { CreateRequestTypeDto } from '../../core/dto/requesttype/create-request-type.dto';

// Default users
export const getDefaultRequestTypes = () => {
  return <CreateRequestTypeDto[]>[
    {
      displayName: 'ANNULATION-TICKET',
      description: 'ANNULATION TICKET',
    },
    {
      displayName: 'IMPRESSION-DUPLICATA',
      description: 'IMPRESSION DUPLICATA',
    },
    {
      displayName: 'PESEE-MANUELLE',
      description: 'PESEE MANUELLE',
    },
    {
      displayName: 'CORRECTION-CODE-CAMION',
      description: 'CORRECTION CODE CAMION',
    },
    {
      displayName: 'CORRECTION-TYPE-OPERATION',
      description: 'CORRECTION TYPE OPERATION',
    },
    {
      displayName: 'CORRECTION-PLANTEUR CODE',
      description: 'CORRECTION PLANTEUR CODE',
    },
  ];
};
