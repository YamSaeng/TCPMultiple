export const USER_SQL_QUERIES = {

    FIND_USER_BY_DEVICE_ID: "SELECT * FROM user WHERE device_id = ?",

    CREATE_USER: "INSERT INTO user (id, device_id) VALUES (?,?)",

    REMOVE_USER: "UPDATE user SET x = ?, y = ? WHERE device_id = ?",

    UPDATE_USER_LOGIN: "UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
}