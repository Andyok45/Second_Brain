import { TwitterIcon } from "../icons/Twitter";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItem } from "./SidebarItem";
import { BrainIcon } from "../icons/BrainIcon";

export function Sidebar({open}: {open: boolean}) {
    return <div className="w-fit rounded-lg" >
        { open && <div className="h-fit border-r w-72 bg-gray-100 border-2 pl-4">
          <div className="">
            <SidebarItem text="Twitter" icon={<TwitterIcon />}/>
            <SidebarItem text="Youtube" icon={<YoutubeIcon />}/>
          </div>
      </div>}
    </div>

}