import { CreateBranchDto } from 'src/core/dto/subsidiary/create-branch.dto';

// Default users
export const getDefaultBranches = () => {
  return <CreateBranchDto[]>[
    {
      displayName: 'DekelOil',
      city: 'Aboisso',
      isActive: true,
      isParentCompany: true,
    },
  ];
};
