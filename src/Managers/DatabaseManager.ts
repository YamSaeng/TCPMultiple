import fs from "fs";
import path from 'path';
import mysql, { FieldPacket, QueryResult } from "mysql2/promise";
import FileParser from "../FileParser.js";
import { FormatDate } from "../utils/DateFormatter.js";
import { config } from "../config/Config.js";

class DatabaseManager {
    private static gInstance: any = null;
    public pools : { [key: string]: any } = {};

    static GetInstance() {
        if (DatabaseManager.gInstance == null) {
            DatabaseManager.gInstance = new DatabaseManager();
        }

        return DatabaseManager.gInstance;
    }

    CreatePool(poolName: string, dbConfig: any) {
        const pool = mysql.createPool({
           host:dbConfig.host,
           port:dbConfig.port,
           user:dbConfig.user,
           password: dbConfig.password,
           database: dbConfig.name,
           waitForConnections:true,
           connectionLimit:10,
           queueLimit:0 
        });

        const originalQuery = pool.query;

        pool.query = async <T extends QueryResult>(sql: any, params?: any): Promise<[T, FieldPacket[]]> => {
            const date = new Date();
            // 쿼리 실행시 로그
            console.log(
                `[${FormatDate(date)}] Executing query: ${sql} ${params ? `, ${JSON.stringify(params)}` : ``
                }`,
            );

            const result = await originalQuery.call(pool, sql, params);
            return result as [T, FieldPacket[]];
        };

        this.pools[poolName] = pool;
    }

    async ExecuteSqlFile(pool : any, filePath: string)
    {
        const sql = fs.readFileSync(filePath, "utf-8");

        const queries = sql
            .split(";")
            .map((query:string)=>query.trim())
            .filter((query:string)=>query.length>0);

        for(const query of queries)
        {
            await pool.query(query);
        }
    }

    async CreateSchemas()
    {
        const sqlDir = FileParser.GetInstance().GetDir("db/sql");
        try{
            await this.ExecuteSqlFile(this.pools["USER_DB"], path.join(sqlDir,"userDB.sql"));

            console.log("데이터베이스 테이블생이 성공적으로 생성되었습니다.");
        }
        catch(error)
        {
            console.error("데이터베이스 테이블 생성 중 오류가 발생했습니다.", error);
        }
    }       

    private constructor() {
        const { databases } = config;

        this.CreatePool("USER_DB",databases.USER_DB);
    }    
}

export default DatabaseManager;