import mysql from "mysql2/promise";
let pool:mysql.Pool|null=null;
export function hasDatabase(){return Boolean(process.env.DB_HOST&&process.env.DB_NAME&&process.env.DB_USER&&process.env.DB_PASSWORD)}
export function db(){if(!hasDatabase())throw new Error("Database environment variables are missing");if(!pool)pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,waitForConnections:true,connectionLimit:10,charset:"utf8mb4"});return pool}
