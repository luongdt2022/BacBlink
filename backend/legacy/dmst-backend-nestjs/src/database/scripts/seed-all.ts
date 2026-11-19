import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/user.entity';
import { Sector } from '../../intakes/sector.entity';

config();

const SALT_ROUNDS = 10;

// Seed data
const ADMIN_SEEDS = [
  {
    email: 'admin1@sotatek.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: '1',
  },
  {
    email: 'admin2@sotatek.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: '2',
  },
  {
    email: 'admin3@sotatek.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: '3',
  },
  {
    email: 'admin4@sotatek.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: '4',
  },
  {
    email: 'admin5@sotatek.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: '5',
  },
];

const USER_SEEDS = [
  {
    email: 'user1@sotatek.com',
    password: 'User@123',
    firstName: 'Nguyễn',
    lastName: 'Văn Minh',
  },
  {
    email: 'user2@sotatek.com',
    password: 'User@123',
    firstName: 'Trần',
    lastName: 'Thị Hương',
  },
  {
    email: 'user3@sotatek.com',
    password: 'User@123',
    firstName: 'Lê',
    lastName: 'Văn Đức',
  },
  {
    email: 'user4@sotatek.com',
    password: 'User@123',
    firstName: 'Phạm',
    lastName: 'Thị Mai',
  },
  {
    email: 'user5@sotatek.com',
    password: 'User@123',
    firstName: 'Hoàng',
    lastName: 'Văn Nam',
  },
  {
    email: 'user6@sotatek.com',
    password: 'User@123',
    firstName: 'Đỗ',
    lastName: 'Thị Lan',
  },
  {
    email: 'user7@sotatek.com',
    password: 'User@123',
    firstName: 'Vũ',
    lastName: 'Văn Hùng',
  },
  {
    email: 'user8@sotatek.com',
    password: 'User@123',
    firstName: 'Nguyễn',
    lastName: 'Thị Ngọc',
  },
  {
    email: 'user9@sotatek.com',
    password: 'User@123',
    firstName: 'Trần',
    lastName: 'Văn Bình',
  },
  {
    email: 'user10@sotatek.com',
    password: 'User@123',
    firstName: 'Lê',
    lastName: 'Thị Yến',
  },
];

const SECTOR_SEEDS = [
  { name: 'Công nghệ thông tin' },
  { name: 'Y tế & Chăm sóc sức khỏe' },
  { name: 'Dược phẩm & Công nghệ sinh học' },
  { name: 'Tài chính & Ngân hàng' },
  { name: 'Giáo dục' },
  { name: 'Nông nghiệp' },
  { name: 'Thực phẩm & Đồ uống' },
  { name: 'Sản xuất & Công nghiệp' },
  { name: 'Tự động hóa & Robot' },
  { name: 'Thương mại điện tử' },
  { name: 'Năng lượng' },
  { name: 'Năng lượng tái tạo' },
  { name: 'Môi trường & Xử lý chất thải' },
  { name: 'Giao thông & Logistics' },
  { name: 'Xây dựng & Hạ tầng' },
  { name: 'Bất động sản' },
  { name: 'Du lịch & Lữ hành' },
  { name: 'Dệt may & Thời trang' },
  { name: 'Viễn thông' },
  { name: 'Media & Giải trí' },
  { name: 'An ninh & Bảo mật' },
  { name: 'Tài nguyên & Khai khoáng' },
  { name: 'Luật & Tư vấn' },
];

async function seedAll() {
  console.log('=== Starting full seed ===\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'dmst_poc',
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: false,
    logging: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  });

  await dataSource.initialize();

  // 1. Seed Admins
  console.log('[1/3] Seeding admins...');
  const userRepo = dataSource.getRepository(User);
  let adminsCreated = 0;
  for (const seed of ADMIN_SEEDS) {
    const existing = await userRepo.findOne({ where: { email: seed.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(seed.password, SALT_ROUNDS);
      await userRepo.save(
        userRepo.create({
          email: seed.email,
          password: hashedPassword,
          firstName: seed.firstName,
          lastName: seed.lastName,
          role: UserRole.ADMIN,
          isActive: true,
        }),
      );
      adminsCreated++;
    }
  }
  console.log(`  Created: ${adminsCreated} admins\n`);

  // 2. Seed Users
  console.log('[2/3] Seeding users...');
  let usersCreated = 0;
  for (const seed of USER_SEEDS) {
    const existing = await userRepo.findOne({ where: { email: seed.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(seed.password, SALT_ROUNDS);
      await userRepo.save(
        userRepo.create({
          email: seed.email,
          password: hashedPassword,
          firstName: seed.firstName,
          lastName: seed.lastName,
          role: UserRole.USER,
          isActive: true,
        }),
      );
      usersCreated++;
    }
  }
  console.log(`  Created: ${usersCreated} users\n`);

  // 3. Seed Sectors
  console.log('[3/3] Seeding sectors...');
  const sectorRepo = dataSource.getRepository(Sector);
  let sectorsCreated = 0;
  for (const seed of SECTOR_SEEDS) {
    const existing = await sectorRepo.findOne({ where: { name: seed.name } });
    if (!existing) {
      await sectorRepo.save(
        sectorRepo.create({ name: seed.name, isActive: true }),
      );
      sectorsCreated++;
    }
  }
  console.log(`  Created: ${sectorsCreated} sectors\n`);

  await dataSource.destroy();
  console.log('=== Seed completed! ===');
}

seedAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
