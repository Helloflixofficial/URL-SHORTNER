import { currentUser } from "@clerk/nextjs";
import { AccountProfile } from "@/Components/Forms/AccountProfile";
async function page() {
  const user = await currentUser();
  const userInfo = {};
  const userData = {
    id: "user?.id",
    objectId: userInfo?._id,
    user: userInfo?.username || user?.username,
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo.bio || "",
    image: userInfo?.image || user.imageUrl,
  };
  return (
    <main className="mx-auto flex flex-col max-w-3x1 justify-start px-10 py-20">
      <h1 className="bg-black head-text">I'ts Working</h1>
      {/* <p className="mt-3 text-light-2 text-base-regular">
        Compleate your login info
      </p> */}
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile
        user={userData}
        btnTitle="Continue"/>
      </section>
    </main>
  );
}
export default page;
