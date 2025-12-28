import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "", {});
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Error Occurred", error);
    process.exit(1);
  }
};

// import mongoose from 'mongoose'
// import { FastifyInstance } from 'fastify'

// try {
//   process.loadEnvFile()
// } catch {}

// export async function connectDB(app: FastifyInstance) {
//   console.log('app.config==>',app.config)
//   console.log('process.env==>',process.env)
//   const uri = process.env.MONGODB_URI

//   if (!uri) {
//     throw new Error('MONGODB_URI is missing')
//   }

//   await mongoose.connect(uri)
//   app.log.info('MongoDB connected successfully')
// }
