const allRoles = {
  user: [],
  admin: ["user:read", "user:create", "user:update", "user:delete"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
