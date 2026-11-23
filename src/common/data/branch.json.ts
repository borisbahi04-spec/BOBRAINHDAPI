import { CreateBranchDto } from 'src/core/dto/subsidiary/create-branch.dto';

// Succursale par défaut (paramétrable dans le .env : APP_DEFAULT_BRANCH_NAME / APP_DEFAULT_BRANCH_CITY)
export const getDefaultBranches = () => {
  return <CreateBranchDto[]>[
    {
      displayName: process.env.APP_DEFAULT_BRANCH_NAME?.trim() || 'DekelOil',
      city: process.env.APP_DEFAULT_BRANCH_CITY?.trim() || 'Aboisso',
      isActive: true,
      isParentCompany: true,
    },
  ];
};
