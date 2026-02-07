import { CreateDepartmentDto } from 'src/core/dto/user/create-department.dto';

// Default users
export const getDefaultDepartments = () => {
  return <CreateDepartmentDto[]>[
    {
      displayName: 'IT',
      description: 'department of information technology',
      isActive: true,
    },
    {
      displayName: 'PRODUCTION',
      description: 'department of production',
      isActive: true,
    },
    {
      displayName: 'ACCONTING',
      description: 'department of accounting',
      isActive: true,
    },
    {
      displayName: 'PLANTING',
      description: 'department of planting',
      isActive: true,
    },
    {
      displayName: 'HR',
      description: 'department of human resources',
      isActive: true,
    },
    {
      displayName: 'SECRETARIAT',
      description: 'department of secretariat',
      isActive: true,
    },
    {
      displayName: 'DIRECTION',
      description: 'department of direction',
      isActive: true,
    },
  ];
};
