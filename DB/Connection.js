import { connect } from "mongoose";




export const dbConnection = () => {
    connect(process.env.DB_URL)
        .then(() => {
            console.log(' connected to DB successfully')
        })
        .catch((err) => {
            console.log("Fail to connect DB", err)
        })
}  
