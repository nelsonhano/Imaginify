import { auth } from "@clerk/nextjs/server"
import TransformationForm from "./shared/TransformationForm"
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Header = async ({ title, subtitle, type }: { title: string, subtitle?: string, type?: TransformationTypeKey }) => {
  const { userId } = auth();

  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId)
  return (
    <> 
          <h2 className="h2-bold text-dark-600">{title}</h2>
          {subtitle && <p className="p-16-regular mt-4">{subtitle}</p>}      

          <section className="mt-10">
            <TransformationForm 
              action="Add"
              userId={user._id}
              type={type as TransformationTypeKey}
              creditBalance={user.creditBalance}
            />  
          </section>
    </>
  )
}

export default Header
