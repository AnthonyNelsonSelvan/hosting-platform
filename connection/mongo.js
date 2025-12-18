import mongoose from "mongoose";


async function connectMongoose(url){
    try {
        await mongoose.connect(url).then(console.log("Mongodb Connected")) 
    } catch (error) {
        console.log(error)
    }
}

export default connectMongoose;