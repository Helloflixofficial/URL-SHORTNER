import { UserButton } from "@clerk/nextjs";
export default function Home() {
  return (
    <div>
    <div>
    </div>
    <section className="text-[red]">
      <h1>Category</h1>
      <h1>Posts</h1>
      <h1>LoadMore</h1>
    </section>
    <div>
      <UserButton afterSignOutUrl="/"/>
    </div>
  </div>
  )
}


