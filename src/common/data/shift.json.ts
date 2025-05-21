import { CreateShiftDto } from "src/core_factory/dto/setting/shift/create-shift.dto";

// Default users
export const getDefaultShifts = () => {
  return <CreateShiftDto[]>[
    {
      value: 1,
    },
    {
      value: 2,
    },
    {
      value: 3,
    },
    {
      value: 4,
    },
  ];
};
