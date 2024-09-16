import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Free User' | 'Paid User';
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Free User', 'Paid User'],
    default: 'Free User',
  },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
