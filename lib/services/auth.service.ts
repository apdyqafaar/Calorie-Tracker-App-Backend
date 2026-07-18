import User from "../model/User";

interface RegisterData {
  name?: string;
  email: string;
  password: string;
}

export class AuthService {
  register = async ({ email, password, name }: RegisterData): Promise<{ name: string; email: string; id: string }> => {
    // 1. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      // Throw a specific error message or a custom error class
      throw new Error('Email already in use');
    }

    const userName = name || email.split('@')[0];

    // 3. Create new user
    const newUser = new User({
      name: userName,
      email: normalizedEmail,
      password: password,
      dailyCalorieIntake: 2000, 
      onboardingCompleted: false,
    });

    await newUser.save(); 
    
    return { name: userName!, email: normalizedEmail, id: newUser._id.toString() };
  }

    login = async ({ email, password, name }: RegisterData): Promise<{ name: string; email: string;dailyCalorieIntake:number; onboardingCompleted:Boolean;id: string }> => {
    // 1. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail}).select('+password');
    if (!existingUser) {
      // Throw a specific error message or a custom error class
      throw new Error('Invalid credentials!');
    }

    // 3. Compare password
    const ismatch = await existingUser.comperePassword(password);
    console.log("ismatch",ismatch)
    if (!ismatch) {
      throw new Error('Invalid email or password');
    }
    
    return { name: existingUser.name, email: normalizedEmail,dailyCalorieIntake:existingUser.dailyCalorieIntake,onboardingCompleted:existingUser.onboardingCompleted,  id: existingUser._id.toString() };
  }

  getUserById = async (userId: string) => {
 try {
     const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
 } catch (error) {
  throw new Error('Error occurred while fetching user details');
 }
  };
}

export const authServices = new AuthService();