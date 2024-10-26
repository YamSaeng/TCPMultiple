import fs from "fs";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mysql, { FieldPacket, QueryResult } from "mysql2/promise";
import FileParser from "../FileParser.js";
import { FormatDate } from "../utils/DateFormatter.js";
import { config } from "../config/Config.js";
import { USER_SQL_QUERIES } from "../utils/db/user/UserQueries.js";

class DatabaseManager {
    private static gInstance: any = null;
    public pools: { [key: string]: any } = {};

    static GetInstance() {
        if (DatabaseManager.gInstance == null) {
            DatabaseManager.gInstance = new DatabaseManager();
        }

        return DatabaseManager.gInstance;
    }

    CreatePool(poolName: string, dbConfig: any) {
        const pool = mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const originalQuery = pool.query;

        pool.query = async <T extends QueryResult>(sql: any, params?: any): Promise<[T, FieldPacket[]]> => {
            // 쿼리 실행시 로그
            // const date = new Date();            
            // console.log(
            //     `[${FormatDate(date)}] Executing query: ${sql} ${params ? `, ${JSON.stringify(params)}` : ``
            //     }`,
            // );

            const result = await originalQuery.call(pool, sql, params);
            return result as [T, FieldPacket[]];
        };

        this.pools[poolName] = pool;
    }

    async ExecuteSqlFile(pool: any, filePath: string) {
        const sql = fs.readFileSync(filePath, "utf-8");

        const queries = sql
            .split(";")
            .map((query: string) => query.trim())
            .filter((query: string) => query.length > 0);

        for (const query of queries) {
            await pool.query(query);
        }
    }

    async CreateSchemas() {
        const sqlDir = FileParser.GetInstance().GetDir("db/sql");
        try {
            await this.ExecuteSqlFile(this.pools["USER_DB"], path.join(sqlDir, "userDB.sql"));

            console.log("데이터베이스 테이블이 성공적으로 생성되었습니다.");
        }
        catch (error) {
            console.error("데이터베이스 테이블 생성 중 오류가 발생했습니다.", error);
        }
    }

    async FindUserByDeviceID(deviceID: string) {
        const [rows] = await this.pools["USER_DB"].query(USER_SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceID]);
        return rows[0];
    }

    async CreateUser(deviceID: string){
        const id = uuidv4();
        await this.pools["USER_DB"].query(USER_SQL_QUERIES.CREATE_USER, [id,deviceID]);

        return { id, deviceID };
    }

    async UpdateUserLogin(id:string){
        await this.pools["USER_DB"].query(USER_SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
    }

    private constructor() {
        const { databases } = config;

        this.CreatePool("USER_DB", databases.USER_DB);
    }
}

export default DatabaseManager;