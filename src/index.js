import connectDb from "./config/db.js";
import {app} from "./app.js";


connectDb();
app.listen(3000,()=>{
    console.log("server is listening on port:3000");
})
