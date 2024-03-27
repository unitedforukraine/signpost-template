import { app } from "../app"
import { Loader } from "./loader"

export function Splash() {

  if (app.state.status != "initializing") return null

  return <div className="w-full h-full flex flex-col justify-center items-center">
    <div className="-mt-40">
      <img src={app.logo} height={80} />
    </div>
    {/* <div className="w-full text-center mt-8 tracking-[0.5rem] uppercase animate-pulse">
      {app.state.info}
    </div> */}
    <div className="mt-10">
      <Loader size={72} width={12} />
    </div>
  </div>

}