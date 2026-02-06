import { PrismaClient, UserStatus, Permission } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function slugifyBranch(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

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
    { name: "USER_READ", description: "View users", category: "User Management" },
    { name: "USER_CREATE", description: "Create users", category: "User Management" },
    { name: "USER_UPDATE", description: "Update users", category: "User Management" },
    { name: "USER_DELETE", description: "Delete users", category: "User Management" },
    { name: "USER_STATUS_UPDATE", description: "Change user status", category: "User Management" },

    { name: "BRANCH_ASSIGN", description: "Assign branch to user", category: "User Management" },
    { name: "PROFILE_UPDATE", description: "Update own profile", category: "User Management" },

    { name: "QUOTATION_READ", description: "View quotations", category: "Quotations" },
    { name: "QUOTATION_CREATE", description: "Create quotations", category: "Quotations" },
    { name: "QUOTATION_UPDATE", description: "Update quotations", category: "Quotations" },
    { name: "QUOTATION_DELETE", description: "Delete quotations", category: "Quotations" },

    { name: "SYSTEM_LOG_READ", description: "View system logs", category: "System Logs" },
    { name: "SYSTEM_LOG_EXPORT", description: "Export system logs", category: "System Logs" },

    { name: "ROLE_READ", description: "View roles", category: "Role Management" },
    { name: "ROLE_CREATE", description: "Create roles", category: "Role Management" },
    { name: "ROLE_UPDATE", description: "Update roles", category: "Role Management" },
    { name: "ROLE_DELETE", description: "Delete roles", category: "Role Management" },

    { name: "PERMISSION_READ", description: "View permissions", category: "Permission Management" },
    { name: "PERMISSION_CREATE", description: "Create permissions", category: "Permission Management" },
    { name: "PERMISSION_UPDATE", description: "Update permissions", category: "Permission Management" },
    { name: "PERMISSION_DELETE", description: "Delete permissions", category: "Permission Management" },
  ];

  const permissions: Permission[] = [];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
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
    "QUOTATION_READ",
    "QUOTATION_CREATE",
    "QUOTATION_UPDATE",
    "QUOTATION_DELETE",
  ];

  const adminPermissions = allPermissions.filter(p =>
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
    "QUOTATION_READ",
    "QUOTATION_CREATE",
    "QUOTATION_UPDATE"
  ];

  const salesPermissions = allPermissions.filter(p =>
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
      branch_id: davaoHeadOffice.id,
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
    },
  });

  const defaultPassword = await bcrypt.hash("123", 10);

  const branches = [
    { branch: davaoHeadOffice, code: "dvo" },
    { branch: airproManila, code: "mnl" },
    { branch: daikinDavao, code: "dkdvo" },
    { branch: airproPasig, code: "psg" },
    { branch: airproDacudao, code: "dac" },
    { branch: airproTalomo, code: "tlm" },
    { branch: airproMintal, code: "mnt" },
  ];

  for (const { branch, code } of branches) {
    // 👉 1 Admin per branch
    const adminUsername = `adm_${code}`;

    const adminUser = await prisma.user.upsert({
      where: { username: adminUsername },
      update: {},
      create: {
        username: adminUsername,
        email: `${adminUsername}@app.com`,
        password: defaultPassword,
        role_id: adminRole.id,
        branch_id: branch.id,
        status: UserStatus.ACTIVE,
      },
    });

    await prisma.profile.upsert({
      where: { user_id: adminUser.id },
      update: {},
      create: {
        user_id: adminUser.id,
        first_name: "Admin",
        last_name: code.toUpperCase(),
        phone: "09123456789",
      },
    });

    // 👉 3 Sales per branch
    for (let i = 1; i <= 3; i++) {
      const salesUsername = `sal_${code}${i}`;

      const salesUser = await prisma.user.upsert({
        where: { username: salesUsername },
        update: {},
        create: {
          username: salesUsername,
          email: `${salesUsername}@app.com`,
          password: defaultPassword,
          role_id: salesRole.id,
          branch_id: branch.id,
          status: UserStatus.ACTIVE,
        },
      });

      await prisma.profile.upsert({
        where: { user_id: salesUser.id },
        update: {},
        create: {
          user_id: salesUser.id,
          first_name: "Sales",
          last_name: `${code.toUpperCase()} ${i}`,
          phone: "09987654321",
        },
      });
    }
  }

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
