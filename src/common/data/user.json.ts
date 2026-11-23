import { CreateUserDto } from 'src/core/dto/user/create-user.dto';

/**
 * Utilisateur par défaut défini dans le .env.
 * Variables : APP_DEFAULT_USER_<n>_<CHAMP>, n = 1, 2, 3… (on s'arrête au premier n sans USERNAME)
 *   USERNAME (obligatoire), PASSWORD (obligatoire), EMAIL, FIRSTNAME, LASTNAME, PHONE,
 *   ROLE (nom du rôle, défaut : admin), ACTIVE (true/false, défaut : true)
 */
export type DefaultUserConfig = CreateUserDto & { roleName: string };

const env = (key: string): string | undefined => {
  const v = process.env[key];
  return v === undefined || v.trim() === '' ? undefined : v.trim();
};

export const getDefaultUsers = (): DefaultUserConfig[] => {
  const users: DefaultUserConfig[] = [];
  for (let n = 1; n <= 20; n++) {
    const p = `APP_DEFAULT_USER_${n}_`;
    const username = env(`${p}USERNAME`);
    if (!username) break;
    const password = env(`${p}PASSWORD`);
    if (!password) {
      console.warn(`*** [DefaultUsers] ${p}PASSWORD manquant : utilisateur "${username}" ignoré`);
      continue;
    }
    users.push(<DefaultUserConfig>{
      username,
      newPassword: password,
      email: env(`${p}EMAIL`),
      phoneNumber: env(`${p}PHONE`),
      firstName: env(`${p}FIRSTNAME`),
      lastName: env(`${p}LASTNAME`),
      isActive: (env(`${p}ACTIVE`) ?? 'true').toLowerCase() !== 'false',
      roleName: env(`${p}ROLE`) ?? 'admin',
    });
  }
  if (users.length === 0) {
    console.warn(
      '*** [DefaultUsers] Aucun APP_DEFAULT_USER_1_USERNAME dans le .env : aucun utilisateur par défaut ne sera créé',
    );
  }
  return users;
};
