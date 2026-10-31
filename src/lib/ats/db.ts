import {
  createPool,
  type Pool,
  type PoolConnection,
  type RowDataPacket,
} from "mysql2/promise";
import { z } from "zod";

let pool: Pool | undefined;
export function atsEnabled() {
  return process.env.ATS_ENABLED === "true";
}
export function getPool() {
  if (!pool) {
    const config = z
      .object({
        host: z.string().min(1),
        port: z.coerce.number().int().positive(),
        user: z.string().min(1),
        password: z.string().min(20),
        database: z.string().regex(/^sankhala_[a-z0-9_]+$/),
      })
      .parse({
        host: process.env.ATS_DB_HOST,
        port: process.env.ATS_DB_PORT ?? 3306,
        user: process.env.ATS_DB_USER,
        password: process.env.ATS_DB_PASSWORD,
        database: process.env.ATS_DB_NAME,
      });
    pool = createPool({
      ...config,
      connectionLimit: 6,
      waitForConnections: true,
      queueLimit: 50,
      timezone: "Z",
      charset: "utf8mb4",
      multipleStatements: false,
      enableKeepAlive: true,
    });
    pool.on("connection", (connection) => {
      connection.query("SET time_zone='+00:00'");
    });
  }
  return pool;
}
export type SqlConnection = Pool | PoolConnection;
export async function rows<T>(
  sql: string,
  values: (string | number | boolean | Date | null | Buffer)[] = [],
  connection: SqlConnection = getPool(),
): Promise<T[]> {
  const [result] = await connection.execute<RowDataPacket[]>(sql, values);
  return result as T[];
}
export function json<T>(value: unknown): T {
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}
export async function transaction<T>(
  work: (connection: PoolConnection) => Promise<T>,
) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const value = await work(connection);
    await connection.commit();
    return value;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
