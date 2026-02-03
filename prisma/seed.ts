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
    })
  }

  // Admin → Limited permissions
  const adminPermissions = permissions.filter(p =>
    ["user.read", "user.create", "user.update", "sales.read"].includes(p.name)
  )

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
    })
  }

  // Sales → Sales permissions only
  const salesPermissions = permissions.filter(p =>
    ["sales.read", "sales.create"].includes(p.name)
  )

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
    })
  }

  const hashedPassword = await bcrypt.hash("superadmin123", 10)

  const superAdminUser = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: hashedPassword,
      role_id: superAdminRole.id,
    },
  })

  await prisma.profile.upsert({
    where: { user_id: superAdminUser.id },
    update: {},
    create: {
      user_id: superAdminUser.id,
      first_name: "System",
      last_name: "Administrator",
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
