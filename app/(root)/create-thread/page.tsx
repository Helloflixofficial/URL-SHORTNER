import { PostThread } from "@/Components/Forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
async function Page() {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <p className="items-center">
        <a href="https://git.io/typing-svg">
          <img
            src="https://readme-typing-svg.demolab.com?font=Fira&weight=200&pause=10000&color=20C20E&background=000000EF&center=true&vCenter=true&random=false&width=720&lines=Name+%3A+Boby+Sharma"
            alt="Typing SVG"
          />
        </a>
      </p>
      <h1 className="head-text">Create thread</h1>
      <PostThread userId={userInfo._id}/>
    </>
  );
}
export default Page;
