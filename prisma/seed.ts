import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: { name: "super_admin" },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  })

  const salesRole = await prisma.role.upsert({
    where: { name: "sales_representative" },
    update: {},
    create: { name: "sales_representative" },
  })

  const permissionsList = [
    "user.read",
    "user.create",
    "user.update",
    "user.delete",
    "sales.read",
    "sales.create",
    "sales.update",
  ]

  const permissions: { id: number; name: string; description: string | null }[] = []

  for (const perm of permissionsList) {
    const permission = await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: {
        name: perm,
        description: `${perm}_permission`,
      },
    })
    permissions.push(permission)
  }

  // Super Admin → All permissions
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // Admin → Limited permissions
  const adminPermissions = permissions.filter(p =>
    ["user.read", "user.create", "user.update", "sales.read"].includes(p.name)
  )

  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // Sales → Sales permissions only
  const salesPermissions = permissions.filter(p =>
    ["sales.read", "sales.create"].includes(p.name)
  )

  for (const perm of salesPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: perm.id,
      },
    })
  }

  const hashedPassword = await bcrypt.hash("superadmin123", 10)

  const superAdminUser = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  })

  await prisma.profile.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      firstName: "System",
      lastName: "Administrator",
      phone: "0000000000",
    },
  })

  console.log("✅ Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
