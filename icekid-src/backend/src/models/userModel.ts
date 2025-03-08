// Mock database
const users: Record<string, any> = {};

export async function getUserProfileFromDB(userId: string) {
  return users[userId] || null;
}

export async function updateUserProfileInDB(userId: string, profileData: any) {
  users[userId] = { ...users[userId], ...profileData };
  return users[userId];
}