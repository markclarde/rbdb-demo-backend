import { PrismaClient, UserStatus, Permission } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: { name: "super_admin" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const salesRole = await prisma.role.upsert({
    where: { name: "sales_representative" },
    update: {},
    create: { name: "sales_representative" },
  });

  const permissionsList = [
    { name: "USER_READ", description: "View users" },
    { name: "USER_CREATE", description: "Create users" },
    { name: "USER_UPDATE", description: "Update users" },
    { name: "USER_DELETE", description: "Delete users" },
    { name: "USER_STATUS_UPDATE", description: "Change user status" },

    { name: "BRANCH_ASSIGN", description: "Assign branch to user" },
    { name: "PROFILE_UPDATE", description: "Update own profile" },

    { name: "SALES_READ", description: "View sales records" },
    { name: "SALES_CREATE", description: "Create sales records" },
    { name: "SALES_UPDATE", description: "Update sales records" },
    { name: "SALES_DELETE", description: "Delete sales records" },
  ];

  const permissions: Permission[] = [];

  for (const perm of permissionsList) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });

    permissions.push(permission);
  }

  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdminRole.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        permission_id: perm.id,
      },
    });
  }

  const adminPermissionNames = [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_STATUS_UPDATE",
    "BRANCH_ASSIGN",
    "PROFILE_UPDATE",
    "SALES_READ",
  ];

  const adminPermissions = permissions.filter(p =>
    adminPermissionNames.includes(p.name)
  );

  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: perm.id,
      },
    });
  }

  const salesPermissionNames = [
    "PROFILE_UPDATE",
    "SALES_READ",
    "SALES_CREATE",
  ];

  const salesPermissions = permissions.filter(p =>
    salesPermissionNames.includes(p.name)
  );

  for (const perm of salesPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: salesRole.id,
          permission_id: perm.id,
        },
      },
      update: {},
      create: {
        role_id: salesRole.id,
        permission_id: perm.id,
      },
    });
  }

  const davaoHeadOffice = await prisma.branch.upsert({
    where: { name: "Davao Head Office" },
    update: {},
    create: { name: "Davao Head Office" },
  });

  const airproManila = await prisma.branch.upsert({
    where: { name: "Airpro Manila" },
    update: {},
    create: { name: "Airpro Manila" },
  });

  const daikinDavao = await prisma.branch.upsert({
    where: { name: "Daikin Air Solutions Shop by AirPro Davao" },
    update: {},
    create: { name: "Daikin Air Solutions Shop by AirPro Davao" },
  });

  const airproPasig = await prisma.branch.upsert({
    where: { name: "Daikin Air Solutions Shop by AirPro Pasig" },
    update: {},
    create: { name: "Daikin Air Solutions Shop by AirPro Pasig" },
  });

  const airproDacudao = await prisma.branch.upsert({
    where: { name: "Airpro Dacudao, Davao" },
    update: {},
    create: { name: "Airpro Dacudao, Davao" },
  });

  const airproTalomo = await prisma.branch.upsert({
    where: { name: "Airpro Talomo, Davao" },
    update: {},
    create: { name: "Airpro Talomo, Davao" },
  });

  const airproMintal = await prisma.branch.upsert({
    where: { name: "Airpro Mintal, Davao" },
    update: {},
    create: { name: "Airpro Mintal, Davao" },
  });

  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  const superAdminUser = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role_id: superAdminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.profile.upsert({
    where: { user_id: superAdminUser.id },
    update: {},
    create: {
      user_id: superAdminUser.id,
      first_name: "System",
      last_name: "Administrator",
      phone: "0000000000",
      branch_id: davaoHeadOffice.id,
    },
  });

  console.log("✅ Seed completed successfully!");
} 

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
