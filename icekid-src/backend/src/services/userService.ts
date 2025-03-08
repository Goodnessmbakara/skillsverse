import { getUserProfileFromDB, updateUserProfileInDB } from "../models/userModel";

export async function getUserProfile(userId: string) {
  return await getUserProfileFromDB(userId);
}

export async function updateUserProfile(userId: string, profileData: any) {
  return await updateUserProfileInDB(userId, profileData);
}