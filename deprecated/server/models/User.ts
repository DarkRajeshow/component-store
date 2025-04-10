import mongoose, { Document, Schema } from "mongoose";

// Define the interface for User document
export interface IUser extends Document {
    username: string;
    dp: string;
    password: string;
    designs: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        dp: {
            type: String,
            default: "newUser.png"
        },
        password: {
            type: String,
            required: true,
        },
        designs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Design",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);