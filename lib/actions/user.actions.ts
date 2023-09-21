'use Server'
import User from "../models/user.models";
import { connecTotDB } from "../mongoose"
export async function updateUser(): Promise<void>{
    connecTotDB();
    User.findOneAndUpdate();
}