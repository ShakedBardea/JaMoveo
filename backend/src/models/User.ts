import mongoose, { Schema } from "mongoose";

export interface IUser {
  username: string;
  password: string;
  instrument: 'none' | 'drums' | 'guitars' | 'bass' | 'saxophone' | 'keyboards' | 'vocals';
  isAdmin: boolean;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  instrument: { 
    type: String,
    enum: ['none', 'drums', 'guitars', 'bass', 'saxophone', 'keyboards', 'vocals'],
    required: true,
  },
  isAdmin: { type: Boolean, default: false }
});


export const User = mongoose.model<IUser>('User', UserSchema);