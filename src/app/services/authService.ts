import api from './api';

export const sendOtp = async (
  email: string
) => {

  const response =
    await api.get('/users');

  const users = response.data;

  const user = users.find(
    (u: any) =>
      u.email === email
  );

  if (!user) {

    throw new Error(
      'User not found'
    );

  }

  return user;

};