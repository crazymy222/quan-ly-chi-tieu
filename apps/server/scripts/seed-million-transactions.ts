/**
 * Tạo hàng loạt giao dịch giả (mặc định 1M) — chèn thẳng vào collection `transactions`.
 *
 * Cần một user và một wallet đã tồn tại trong DB (lấy _id từ Compass/mongosh).
 *
 * Chạy từ thư mục apps/server:
 *   pnpm seed:transactions
 *
 * File `apps/server/.env` được đọc tự động (MONGO_URI + SEED_* nếu có).
 *
 * Biến môi trường (hoặc trong .env):
 *   MONGO_URI        — bắt buộc (giống app, xem .env.example)
 *   SEED_USER_ID     — bắt buộc, ObjectId hex 24 ký tự
 *   SEED_WALLET_ID   — bắt buộc
 *   SEED_TOTAL       — mặc định 1000000
 *   SEED_BATCH       — mặc định 5000 (kích thước mỗi lần insertMany)
 *
 * PowerShell: `set VAR=x` là CMD; process con không nhận được. Dùng:
 *   $env:MONGO_URI = 'mongodb://...'
 *   $env:SEED_USER_ID = '...'; $env:SEED_WALLET_ID = '...'
 */
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Gán vào process.env nếu chưa có (đơn giản; không hỗ trợ multi-line). */
function loadDotEnvFromFile(absPath: string) {
  if (!existsSync(absPath)) return;
  const raw = readFileSync(absPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnvFromFile(join(__dirname, '..', '.env'));

const TOTAL = Number(process.env.SEED_TOTAL ?? 1_000_000);
const BATCH = Number(process.env.SEED_BATCH ?? 5_000);

const CATEGORIES = [
  'Ăn uống',
  'Di chuyển',
  'Giải trí',
  'Hóa đơn',
  'Lương',
  'Khác',
];
const TYPES = ['INCOME', 'EXPENSE'] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomAmount(type: (typeof TYPES)[number]): number {
  const base = type === 'INCOME' ? 5_000_000 : 10_000;
  const spread = type === 'INCOME' ? 20_000_000 : 5_000_000;
  return Math.round(base + Math.random() * spread);
}

async function main() {
  const uri = process.env.MONGO_URI;
  const userHex = process.env.SEED_USER_ID;
  const walletHex = process.env.SEED_WALLET_ID;

  if (!uri || !userHex || !walletHex) {
    console.error(
      'Thiếu MONGO_URI, SEED_USER_ID, SEED_WALLET_ID.\n' +
      '  • Thêm vào apps/server/.env hoặc\n' +
      '  • PowerShell: $env:MONGO_URI = "..."; $env:SEED_USER_ID = "..."; $env:SEED_WALLET_ID = "..."\n' +
      '    (lệnh CMD `set VAR=x` không truyền xuống pnpm/node.)',
    );
    process.exit(1);
  }

  if (!mongoose.Types.ObjectId.isValid(userHex)) {
    console.error('SEED_USER_ID không phải ObjectId hợp lệ');
    process.exit(1);
  }
  if (!mongoose.Types.ObjectId.isValid(walletHex)) {
    console.error('SEED_WALLET_ID không phải ObjectId hợp lệ');
    process.exit(1);
  }

  const userId = new mongoose.Types.ObjectId(userHex);
  const walletId = new mongoose.Types.ObjectId(walletHex);

  await mongoose.connect(uri);
  const col = mongoose.connection.collection('transactions');

  let inserted = 0;
  const started = Date.now();

  while (inserted < TOTAL) {
    const chunk = Math.min(BATCH, TOTAL - inserted);
    const docs = Array.from({ length: chunk }, () => {
      const transactionType = pick(TYPES);
      const createdAt = new Date(Date.now());
      return {
        transferId: randomUUID(),
        transactionType,
        amount: randomAmount(transactionType),
        note: Math.random() < 0.3 ? `seed-${inserted}` : null,
        transactionCategory: pick(CATEGORIES),
        user: userId,
        wallet: walletId,
        runningBalance: 0,
        deletedAt: null,
        createdAt,
        updatedAt: createdAt,
        __v: 0,
      };
    });

    await col.insertMany(docs, { ordered: false });
    inserted += chunk;
    if (inserted % 50_000 === 0 || inserted === TOTAL) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`Đã chèn ${inserted.toLocaleString()} / ${TOTAL.toLocaleString()} (${elapsed}s)`);
    }
  }

  await mongoose.disconnect();
  console.log('Hoàn tất.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
