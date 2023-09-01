"use client";
interface props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}
export const AccountProfile = ({ user, btnTitle }) => {
  return <div>Account Profile</div>;
};
